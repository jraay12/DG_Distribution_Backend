import { ExtendedPrismaClient } from "../../config/prisma";

export class QuotaRepository {
  constructor(private prisma: ExtendedPrismaClient) {}

  upsert(data: { id: string; user_id: string; period_start: Date; period_end: Date; target_amount: number }) {
    return this.prisma.agentQuota.upsert({
      where: {
        user_id_period_start_period_end: {
          user_id: data.user_id,
          period_start: data.period_start,
          period_end: data.period_end,
        },
      },
      create: data,
      update: { target_amount: data.target_amount },
    });
  }

  findForUser(user_id: string, from?: Date, to?: Date) {
    return this.prisma.agentQuota.findMany({
      where: {
        user_id,
        period_end: from ? { gte: from } : undefined,
        period_start: to ? { lte: to } : undefined,
      },
      orderBy: { period_start: "desc" },
    });
  }

  findAll(from?: Date, to?: Date) {
    return this.prisma.agentQuota.findMany({
      where: {
        period_end: from ? { gte: from } : undefined,
        period_start: to ? { lte: to } : undefined,
      },
      include: { user: { select: { id: true, name: true, email: true, isActive: true } } },
      orderBy: [{ period_start: "desc" }, { user_id: "asc" }],
    });
  }

  async salesTotal(user_id: string, from: Date, to: Date): Promise<number> {
    const result = await this.prisma.transaction.aggregate({
      where: {
        type: "SALE",
        storeVisit: { user_id },
        createdAt: { gte: from, lte: to },
      },
      _sum: { total_amount: true },
    });
    return result._sum.total_amount?.toNumber() ?? 0;
  }
}
