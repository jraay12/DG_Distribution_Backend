import { Prisma } from "@prisma/client";
import { ExtendedPrismaClient } from "../../config/prisma";

const brandSelection = {
  select: { model: { select: { brand: { select: { id: true, brand_name: true } } } } },
} satisfies Prisma.ProductDefaultArgs;

export class PerformanceRepository {
  constructor(private prisma: ExtendedPrismaClient) {}

  setTarget(data: Prisma.PerformanceTargetUncheckedCreateInput) {
    const { user_id, brand_id, period, period_date, sales, calls, promo } = data;
    return this.prisma.performanceTarget.upsert({
      where: { user_id_brand_id_period_period_date: { user_id, brand_id, period, period_date } },
      create: data,
      update: { sales, calls, promo },
    });
  }

  getDashboard(user_id: string, month: Date, date: Date, monthToDate: Prisma.DateTimeFilter) {
    return this.prisma.$transaction([
      this.prisma.performanceTarget.findMany({
        where: {
          user_id,
          OR: [{ period: "MONTHLY", period_date: month }, { period: "DAILY", period_date: date }],
        },
        include: { brand: { select: { id: true, brand_name: true } } },
      }),
      this.prisma.transaction.findMany({
        where: { type: "SALE", storeVisit: { user_id }, createdAt: monthToDate },
        select: {
          createdAt: true, subtotal_amount: true, total_amount: true, promo_code_id: true,
          items: { select: { quantity: true, price: true, product: brandSelection } },
        },
      }),
      this.prisma.storeVisit.findMany({
        where: { user_id, deletedAt: null, time_in: { not: null }, time_out: monthToDate },
        select: {
          time_out: true,
          inventoryItems: { select: { product: brandSelection } },
          order: {
            select: {
              items: { where: { actual_quantity: { gt: 0 } }, select: { product: brandSelection } },
            },
          },
          transaction: {
            where: { type: "SALE" },
            select: { items: { select: { product: brandSelection } } },
          },
        },
      }),
    ]);
  }
}
