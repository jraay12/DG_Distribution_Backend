import { Prisma } from "@prisma/client";
import { formatInTimeZone } from "date-fns-tz";
import { calendarDate, dateString, manilaMidnight, manilaTimeZone, nextDate } from "../../utils/calendar-date";
import { BadRequestError } from "../../utils/error/BadRequestError";
import { NotFoundError } from "../../utils/error/NotFoundError";
import { nonnegativeInteger, requiredText } from "../../utils/input";
import { BrandRepository } from "../brand/brand.repository";
import { UserRepository } from "../user/user.repository";
import { PerformanceRepository } from "./performance.repository";

type Brand = { id: string | null; brand_name: string };
const metrics = ["sales", "calls", "promo"] as const;
type Metric = typeof metrics[number];
type Values = Record<Metric, Prisma.Decimal>;
type Period = { target: Values | null; actual: Values };
const emptyPeriod = (): Period => ({
  target: null,
  actual: { sales: new Prisma.Decimal(0), calls: new Prisma.Decimal(0), promo: new Prisma.Decimal(0) },
});

export class PerformanceService {
  constructor(
    private performanceRepo: PerformanceRepository,
    private userRepo: UserRepository,
    private brandRepo: BrandRepository,
  ) {}

  async setTarget(input: {
    user_id?: unknown; brand_id?: unknown; period?: unknown; period_date?: unknown;
    sales?: unknown; calls?: unknown; promo?: unknown;
  }) {
    const user_id = requiredText(input?.user_id, "user_id");
    const brand_id = requiredText(input?.brand_id, "brand_id");
    const period = input.period;
    if (period !== "DAILY" && period !== "MONTHLY") throw new BadRequestError("period must be DAILY or MONTHLY");
    const period_date = calendarDate(input.period_date, "period_date");
    if (period === "MONTHLY" && period_date.getUTCDate() !== 1) {
      throw new BadRequestError("Use the first day of the month for a monthly target");
    }
    if (typeof input.sales !== "number" || !Number.isFinite(input.sales) ||
        input.sales < 0 || input.sales > 9999999999.99) {
      throw new BadRequestError("sales must be a non-negative amount up to 9999999999.99");
    }
    const sales = new Prisma.Decimal(input.sales);
    if (sales.decimalPlaces() > 2) throw new BadRequestError("sales supports up to two decimal places");
    const calls = nonnegativeInteger(input.calls, "calls");
    const promo = nonnegativeInteger(input.promo, "promo");
    const [user, brand] = await Promise.all([this.userRepo.findById(user_id), this.brandRepo.findById(brand_id)]);
    if (!user || user.role !== "USER" || !user.isActive) throw new NotFoundError("Active agent not found");
    if (!brand || brand.isDeleted) throw new NotFoundError("Active brand not found");
    return this.performanceRepo.setTarget({ user_id, brand_id, period, period_date, sales, calls, promo });
  }

  async mine(user_id: string, input: unknown) {
    const today = formatInTimeZone(new Date(), manilaTimeZone, "yyyy-MM-dd");
    const date = calendarDate(input === undefined ? today : input, "date");
    const month = new Date(date);
    month.setUTCDate(1);
    const dailyStart = manilaMidnight(date);
    const [agent, [targets, sales, visits]] = await Promise.all([
      this.userRepo.findById(user_id),
      this.performanceRepo.getDashboard(user_id, month, date, {
        gte: manilaMidnight(month), lt: manilaMidnight(nextDate(date)),
      }),
    ]);
    if (!agent) throw new NotFoundError("Agent not found");

    const rows = new Map<string | null, { brand: Brand; mtd: Period; daily: Period }>();
    const rowFor = (brand: Brand) => {
      let row = rows.get(brand.id);
      if (!row) {
        row = { brand, mtd: emptyPeriod(), daily: emptyPeriod() };
        rows.set(brand.id, row);
      }
      return row;
    };
    const add = (brand: Brand, metric: Metric, amount: Prisma.Decimal | number, time: Date) => {
      const row = rowFor(brand);
      row.mtd.actual[metric] = row.mtd.actual[metric].plus(amount);
      if (time >= dailyStart) row.daily.actual[metric] = row.daily.actual[metric].plus(amount);
    };

    for (const target of targets) {
      const row = rowFor(target.brand);
      const period = target.period === "MONTHLY" ? row.mtd : row.daily;
      period.target = {
        sales: target.sales, calls: new Prisma.Decimal(target.calls), promo: new Prisma.Decimal(target.promo),
      };
    }
    for (const sale of sales) {
      const brands = new Map<string, { brand: { id: string; brand_name: string }; gross: Prisma.Decimal }>();
      for (const item of sale.items) {
        const brand = item.product.model.brand;
        const price = item.price ?? new Prisma.Decimal(0);
        // Older sales stored the extended line price and a zero transaction total.
        const gross = sale.subtotal_amount === null ? price : price.times(item.quantity);
        brands.set(brand.id, { brand, gross: gross.plus(brands.get(brand.id)?.gross ?? 0) });
      }
      const lines = [...brands.values()].sort((a, b) => a.brand.id.localeCompare(b.brand.id));
      const gross = lines.reduce((total, item) => total.plus(item.gross), new Prisma.Decimal(0));
      const net = sale.subtotal_amount === null ? gross : sale.total_amount ?? gross;
      // Allocate rounded net sales by each brand's share of the sale.
      let grossSoFar = new Prisma.Decimal(0);
      let netSoFar = new Prisma.Decimal(0);
      for (const { brand, gross: brandGross } of lines) {
        grossSoFar = grossSoFar.plus(brandGross);
        const allocated = gross.isZero() ? gross : net.times(grossSoFar).div(gross).toDecimalPlaces(2);
        add(brand, "sales", allocated.minus(netSoFar), sale.createdAt);
        netSoFar = allocated;
        if (sale.promo_code_id) add(brand, "promo", 1, sale.createdAt);
      }
    }
    for (const visit of visits) {
      const items = [
        ...visit.inventoryItems, ...(visit.order?.items ?? []),
        ...visit.transaction.flatMap((sale) => sale.items),
      ];
      const brands = new Map(items.map(({ product }) => [product.model.brand.id, product.model.brand]));
      if (!brands.size) add({ id: null, brand_name: "Unattributed" }, "calls", 1, visit.time_out!);
      for (const brand of brands.values()) add(brand, "calls", 1, visit.time_out!);
    }

    const format = (period: Period, metric: Metric) => {
      const target = period.target?.[metric] ?? null;
      const actual = period.actual[metric];
      return {
        target: target?.toNumber() ?? null,
        actual: actual.toNumber(),
        achievement_percentage: target?.gt(0) ? actual.times(100).div(target).toDecimalPlaces(2).toNumber() : null,
      };
    };

    return {
      agent: { id: agent.id, name: agent.name },
      date: dateString(date),
      month: dateString(month).slice(0, 7),
      timezone: manilaTimeZone,
      rows: [...rows.values()]
        .sort((a, b) => a.brand.brand_name.localeCompare(b.brand.brand_name))
        .flatMap(({ brand, mtd, daily }) => metrics.map((metric) => ({
          brand_id: brand.id, brand_name: brand.brand_name, metric,
          month_to_date: format(mtd, metric), daily: format(daily, metric),
        }))),
    };
  }
}
