import { ExtendedPrismaClient } from "../../config/prisma";

export class ReportRepository {
  constructor(private prisma: ExtendedPrismaClient) {}

  getSales(filters: { from?: Date; to?: Date; user_id?: string }) {
    return this.prisma.transaction.findMany({
      where: {
        type: "SALE",
        createdAt: filters.from || filters.to ? { gte: filters.from, lte: filters.to } : undefined,
        storeVisit: { user_id: filters.user_id },
      },
      include: {
        storeVisit: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            customer: { select: { id: true, store_name: true, owner_name: true } },
          },
        },
        promoCode: { select: { code: true } },
        items: { include: { product: { select: { product_name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  getInventory() {
    return this.prisma.product.findMany({
      where: { deletedAt: null },
      include: {
        model: { include: { brand: true } },
        inventory: true,
        storeInventory: { include: { customer: true } },
      },
      orderBy: { product_name: "asc" },
    });
  }

  getAgentPerformance(filters: { from?: Date; to?: Date; user_id?: string }) {
    return this.prisma.user.findMany({
      where: { role: "USER", id: filters.user_id },
      select: {
        id: true, name: true, email: true, isActive: true,
        storeVisit: {
          where: { visit_date: filters.from || filters.to ? { gte: filters.from, lte: filters.to } : undefined },
          include: { transaction: { where: { type: "SALE" } }, deliveryReports: true },
        },
      },
      orderBy: { name: "asc" },
    });
  }
}
