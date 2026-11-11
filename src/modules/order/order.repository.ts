import { Prisma } from "@prisma/client";
import { ExtendedPrismaClient } from "../../config/prisma";

const orderDetails = {
  storeVisit: {
    select: {
      user_id: true,
      customer_id: true,
      visit_date: true,
      user: { select: { id: true, name: true } },
      customer: { select: { id: true, store_name: true, owner_name: true, territory: true } },
    },
  },
  items: {
    include: { product: { select: { id: true, product_name: true } } },
    orderBy: { product_id: "asc" },
  },
} satisfies Prisma.CustomerOrderInclude;

export type OrderDetails = Prisma.CustomerOrderGetPayload<{ include: typeof orderDetails }>;

export class OrderRepository {
  constructor(private prisma: ExtendedPrismaClient) {}

  findByVisit(store_visit_id: string, tx = this.prisma) {
    return tx.customerOrder.findUnique({ where: { store_visit_id }, include: orderDetails });
  }

  create(
    store_visit_id: string,
    items: Prisma.CustomerOrderItemUncheckedCreateWithoutOrderInput[],
    tx: ExtendedPrismaClient,
  ) {
    return tx.customerOrder.create({
      data: { store_visit_id, items: { create: items } },
      include: orderDetails,
    });
  }

  async list(where: Prisma.CustomerOrderWhereInput, page: number, limit: number) {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.customerOrder.findMany({
        where, include: orderDetails, skip: (page - 1) * limit, take: limit,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      }),
      this.prisma.customerOrder.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPage: Math.ceil(total / limit) } };
  }
}
