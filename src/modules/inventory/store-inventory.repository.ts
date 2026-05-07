import { ExtendedPrismaClient, prisma } from "../../config/prisma";
import { StoreInventory } from "@prisma/client";

export class StoreInventoryRepositiory {
  constructor(private prisma: ExtendedPrismaClient) {}

  async create(
    data: Omit<StoreInventory, "createdAt" | "updatedAt">,
    tx?: typeof this.prisma,
  ) {
    const client = tx ?? (this.prisma as ExtendedPrismaClient);
    await client.storeInventory.create({
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

  async increaseStock(
    customer_id: string,
    product_id: string,
    quantity: number,
    tx?: ExtendedPrismaClient,
  ) {
    const client = tx ?? this.prisma;

    return await client.storeInventory.upsert({
      where: {
        customer_id_product_id: {
          customer_id,
          product_id,
        },
      },
      create: {
        customer_id,
        product_id,
        quantity,
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
    });
  }

  async decreaseStock(
    customer_id: string,
    product_id: string,
    quantity: number,
    tx?: ExtendedPrismaClient,
  ) {
    const client = tx ?? this.prisma;

    return await client.storeInventory.upsert({
      where: {
        customer_id_product_id: {
          customer_id,
          product_id,
        },
      },
      create: {
        customer_id,
        product_id,
        quantity,
      },
      update: {
        quantity: {
          decrement: quantity,
        },
      },
    });
  }

  async findByStoreAndProduct(customer_id: string, product_id: string) {
    return await this.prisma.storeInventory.findUnique({
      where: {
        customer_id_product_id: {
          customer_id,
          product_id,
        },
      },
    });
  }
}
