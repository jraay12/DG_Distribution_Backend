import { ExtendedPrismaClient } from "../../config/prisma";
import { Transaction } from "./transaction.entity";

export class TransactionRepository {
  constructor(private prisma: ExtendedPrismaClient) {}

  async save(transaction: Transaction): Promise<void> {
    await this.prisma.transaction.create({
      data: {
        id: transaction.id,
        store_visit_id: transaction.storeVisitId,
        type: transaction.type,
        total_amount: transaction.totalAmount,
        createdAt: transaction.createdAt,

        items: {
          create: transaction.items.map((item) => ({
            id: item.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.transaction.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        storeVisit: true,
      },
    });
  }

  async findByStoreVisit(storeVisitId: string) {
    return this.prisma.transaction.findMany({
      where: { store_visit_id: storeVisitId },
      include: {
        items: true,
      },
    });
  }
}