import { ExtendedPrismaClient } from "../../config/prisma";
import { StoreInventory, VisitInventoryItem } from "@prisma/client";

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

    const result = await client.storeInventory.updateMany({
      where: { customer_id, product_id, quantity: { gte: quantity } },
      data: { quantity: { decrement: quantity } },
    });
    if (result.count !== 1) return null;
    return client.storeInventory.findUnique({
      where: { customer_id_product_id: { customer_id, product_id } },
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

  async findInventoriesByCustomerId(customer_id: string) {
    return await this.prisma.storeInventory.findMany({
      where: {
        customer_id
      },
      include : {
        product: {
          select: {
            product_name: true
          },
        },
        customer: {
          select: {
            owner_name: true,
            store_name: true
          }
        }
      }
    })
  }
  findVisitCount(store_visit_id: string, tx = this.prisma) {
    return tx.visitInventoryItem.findMany({
      where: { store_visit_id },
      include: { product: { select: { product_name: true, deletedAt: true } } },
      orderBy: [{ suggested_quantity: "desc" }, { product_id: "asc" }],
    });
  }

  async replaceVisitCount(store_visit_id: string, items: VisitInventoryItem[], tx: ExtendedPrismaClient) {
    await tx.visitInventoryItem.deleteMany({ where: { store_visit_id } });
    await tx.visitInventoryItem.createMany({ data: items });
    return this.findVisitCount(store_visit_id, tx);
  }
}
