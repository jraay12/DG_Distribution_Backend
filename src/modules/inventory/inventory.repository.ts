import { ExtendedPrismaClient } from "../../config/prisma";
import { AddStockInventoryDTO } from "./dto/AddStockInventoryDTO";
import { Inventory } from "./inventory.entity";

export class InventoryRepository {
  constructor(private prisma: ExtendedPrismaClient) {}

  async addStock(inventory: Inventory): Promise<void> {
    await this.prisma.inventory.update({
      where: { id: inventory.id },
      data: {
        quantity: inventory.quantity,
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
