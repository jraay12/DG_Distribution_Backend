import { ExtendedPrismaClient } from "../../config/prisma";
import { AddStockInventoryDTO } from "./dto/AddStockInventoryDTO";
import { Inventory } from "./inventory.entity";

export class InventoryRepository {
  constructor(private prisma: ExtendedPrismaClient) {}

  async update(inventory: Inventory, tx?: typeof this.prisma): Promise<void> {

    const client = tx ?? (this.prisma as ExtendedPrismaClient);
    await client.inventory.update({
      where: { product_id: inventory.productId },
      data: {
        quantity: inventory.quantity,
        reorder_level: inventory.reorderLevel ?? null
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

    return Inventory.hydrate(inventory)
  }
}
