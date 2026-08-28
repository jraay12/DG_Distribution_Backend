import crypto from "crypto";
import { BadRequestError } from "../../utils/error/BadRequestError";
import { ForbiddenError } from "../../utils/error/ForbiddenError";
import { NotFoundError } from "../../utils/error/NotFoundError";
import { UserRepository } from "../user/user.repository";
import { QuotaRepository } from "./quota.repository";

export class QuotaService {
  constructor(private quotaRepo: QuotaRepository, private userRepo: UserRepository) {}

  private date(value: string | Date, label: string): Date {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) throw new BadRequestError(`Invalid ${label}`);
    return date;
  }

  async setQuota(data: { user_id: string; period_start: string | Date; period_end: string | Date; target_amount: number }) {
    const user = await this.userRepo.findById(data.user_id);
    if (!user) throw new NotFoundError("User not found");
    if (user.role !== "USER") throw new ForbiddenError("Quotas can only be assigned to agents");
    const period_start = this.date(data.period_start, "period start");
    const period_end = this.date(data.period_end, "period end");
    if (period_end < period_start) throw new BadRequestError("Period end must be after period start");
    if (!Number.isFinite(Number(data.target_amount)) || Number(data.target_amount) <= 0) {
      throw new BadRequestError("Target amount must be greater than zero");
    }
    return this.quotaRepo.upsert({
      id: crypto.randomUUID(), user_id: data.user_id, period_start, period_end,
      target_amount: Number(data.target_amount),
    });
  }

  async getProgress(user_id: string, from?: string, to?: string) {
    const start = from ? this.date(from, "from date") : undefined;
    const end = to ? this.date(to, "to date") : undefined;
    const quotas = await this.quotaRepo.findForUser(user_id, start, end);
    return Promise.all(quotas.map(async quota => {
      const sales = await this.quotaRepo.salesTotal(user_id, quota.period_start, quota.period_end);
      const target = quota.target_amount.toNumber();
      const progress = target === 0 ? 0 : Math.round((sales / target) * 10000) / 100;
      return {
        ...quota,
        target_amount: target,
        sales_amount: sales,
        progress_percentage: progress,
        status: sales >= target ? "ACHIEVED" : sales > 0 ? "IN_PROGRESS" : "NOT_STARTED",
      };
    }));
  }

  async getAll(from?: string, to?: string) {
    const quotas = await this.quotaRepo.findAll(
      from ? this.date(from, "from date") : undefined,
      to ? this.date(to, "to date") : undefined,
    );
    return Promise.all(quotas.map(async quota => {
      const sales = await this.quotaRepo.salesTotal(quota.user_id, quota.period_start, quota.period_end);
      const target = quota.target_amount.toNumber();
      return {
        ...quota,
        target_amount: target,
        sales_amount: sales,
        progress_percentage: Math.round((sales / target) * 10000) / 100,
        status: sales >= target ? "ACHIEVED" : sales > 0 ? "IN_PROGRESS" : "NOT_STARTED",
      };
    }));
  }
}
