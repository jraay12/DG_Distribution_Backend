import { ExtendedPrismaClient, prisma } from "../../config/prisma";
import { StoreInventory } from "@prisma/client";

export class StoreInventoryRepositiory {
  constructor(private prisma: ExtendedPrismaClient) {}

  async create(data: Omit<StoreInventory, "createdAt" | "updatedAt">, tx?: typeof this.prisma) {
    const client = tx ?? (this.prisma as ExtendedPrismaClient);
    return await client.storeInventory.create({
      data,
    });
  }

  async findById(id: string): Promise<StoreInventory | null> {
    const record = await this.prisma.storeInventory.findUnique({
      where: {
        id,
      },
    });

    if (!record) return null;

    return record;
  }
}
