import { ExtendedPrismaClient } from './../../config/prisma';
import { StockMovement } from './stock-movement.entity';

export class StockMovementRepository {
  constructor(private prisma: ExtendedPrismaClient){}

  async save(stockMovement: StockMovement, tx?: typeof this.prisma): Promise<void> {

    const client = tx ?? (this.prisma as ExtendedPrismaClient);

    await client.stockMovement.create({
      data: {
        id: stockMovement.id,
        type: stockMovement.type,
        quantity: stockMovement.quantity,
        created_by: stockMovement.createdBy,
        createdAt: stockMovement.createdAt,
        product_id: stockMovement.productId
      }
    })
  }
}