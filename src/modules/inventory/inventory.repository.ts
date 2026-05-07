import { ExtendedPrismaClient } from "../../config/prisma";
import { Inventory } from "./inventory.entity";

export class InventoryRepository {
  constructor(private prisma: ExtendedPrismaClient) {}

  async update(inventory: Inventory, tx?: typeof this.prisma) {
    const client = tx ?? (this.prisma as ExtendedPrismaClient);
    return await client.inventory.update({
      where: { product_id: inventory.productId },
      data: {
        quantity: inventory.quantity,
        reorder_level: inventory.reorderLevel ?? null,
      },
    });
  }

  async findById(product_id: string): Promise<Inventory | null> {
    const inventory = await this.prisma.inventory.findUnique({
      where: {
        product_id,
      },
    });

    if (!inventory) return null;

    return Inventory.hydrate(inventory);
  }

  async deductStockAtomic(
    product_id: string,
    quantity: number,
    tx?: typeof this.prisma,
  ) {
    const client = tx ?? (this.prisma as ExtendedPrismaClient);

    await client.inventory.updateMany({
      where: {
        product_id,
        quantity: { gte: quantity },
      },
      data: {
        quantity: {
          decrement: quantity,
        },
      },
    });

    const updated = await client.inventory.findUnique({
      where: { product_id },
      select: {
        product_id: true,
        quantity: true,
      },
    });

    return updated;
  }
}
