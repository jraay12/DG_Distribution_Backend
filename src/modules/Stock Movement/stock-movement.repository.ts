import { ExtendedPrismaClient } from "./../../config/prisma";
import { StockMovement } from "./stock-movement.entity";

export class StockMovementRepository {
  constructor(private prisma: ExtendedPrismaClient) {}

  async save(
    stockMovement: StockMovement,
    tx?: typeof this.prisma,
  ): Promise<void> {
    const client = tx ?? (this.prisma as ExtendedPrismaClient);

    await client.stockMovement.create({
      data: {
        id: stockMovement.id,
        type: stockMovement.type,
        quantity: stockMovement.quantity,
        created_by: stockMovement.createdBy,
        createdAt: stockMovement.createdAt,
        product_id: stockMovement.productId,
        store_id: stockMovement.storeId ?? null,
      },
    });
  }

  async createMany(
    stockMovements: StockMovement[],
    tx?: typeof this.prisma,
  ): Promise<void> {
    const client = tx ?? (this.prisma as ExtendedPrismaClient);

    await client.stockMovement.createMany({
      data: stockMovements.map((movement) => ({
        id: movement.id,
        type: movement.type,
        quantity: movement.quantity,
        created_by: movement.createdBy,
        createdAt: movement.createdAt,
        product_id: movement.productId,
        store_id: movement.storeId ?? null,
      })),
    });
  }

  async getTopOutMovements(customer_id: string) {
    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return this.prisma.stockMovement.groupBy({
      by: ["product_id"],
      where: {
        store_id: customer_id,
        type: "OUT",
        createdAt: {
          gte: startOfMonth,
          lt: startOfNextMonth,
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 3,
    });
  }
}
