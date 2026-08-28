import { ProductRepository } from "../product/product.repository";
import { ExtendedPrismaClient } from "../../config/prisma";

export class StatsService {
  constructor(private productRepo: ProductRepository, private prisma: ExtendedPrismaClient) {}

  async getDashboardStats() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const [productCount, activeAgents, inventory, sales, visits] = await Promise.all([
      this.productRepo.productCount(),
      this.prisma.user.count({ where: { role: "USER", isActive: true } }),
      this.prisma.inventory.findMany(),
      this.prisma.transaction.aggregate({
        where: { type: "SALE", createdAt: { gte: startOfMonth } },
        _sum: { total_amount: true }, _count: true,
      }),
      this.prisma.storeVisit.findMany({ where: { visit_date: { gte: startOfMonth } } }),
    ]);

    return {
      productCount,
      activeAgents,
      warehouseUnits: inventory.reduce((sum, item) => sum + item.quantity, 0),
      lowStockProducts: inventory.filter(item => item.reorder_level != null && item.quantity <= item.reorder_level).length,
      monthlySales: sales._sum.total_amount?.toNumber() ?? 0,
      monthlySalesCount: sales._count,
      assignedVisits: visits.length,
      completedVisits: visits.filter(visit => visit.time_in && visit.time_out).length,
    };
  }
}
