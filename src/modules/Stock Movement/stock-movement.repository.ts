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
        store_id: stockMovement.storeId ?? null
        
        
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
      })),
    });
  }
}
