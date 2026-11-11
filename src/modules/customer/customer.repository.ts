import { Prisma } from "@prisma/client";
import { ExtendedPrismaClient } from "../../config/prisma";
import { Customer } from "./customer.entity";

export class CustomerRepository {
  constructor(private prisma: ExtendedPrismaClient) {}

  async save(customer: Customer): Promise<void> {
    await this.prisma.customer.create({
      data: customer.toJSON(),
    });
  }

  async findById(customer_id: string): Promise<Customer | null> {
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customer_id,
      },
    });

    if (!customer) return null;

    return Customer.hydrate(customer);
  }

  async update(customer: Customer): Promise<void> {
    const { id, createdAt, deletedAt, ...details } = customer.toJSON();
    await this.prisma.customer.update({
      where: {
        id: customer.id,
      },
      data: details,
    });
  }

  async delete(customer_id: string): Promise<void> {
    await this.prisma.customer.delete({
      where: {
        id: customer_id,
      },
    });
  }

  async restore(customer_id: string): Promise<void> {
    await this.prisma.customer.update({
      where: {
        id: customer_id,
      },
      data: {
        deletedAt: null,
      },
    });
  }

  async getCustomers(
    status: "all" | "active" | "deleted" = "active",
    territory?: string,
  ): Promise<Customer[]> {
    const whereClause: Prisma.CustomerWhereInput = { territory };

    if (status) {
      whereClause.deletedAt =
        status === "active"
          ? null
          : status === "deleted"
            ? { not: null }
            : undefined;
    }

    const customers = await this.prisma.customer.findMany({
      where: whereClause,
    });

    return customers.map((customer) => Customer.hydrate(customer));
  }

  async findByIds(ids: string[]) {
    return this.prisma.customer.findMany({
      where: {
        deletedAt: null,
        id: {
          in: ids,
        },
        
      },
    });
  }
  async listTerritories() {
    const groups = await this.prisma.customer.groupBy({
      by: ["territory"],
      where: { deletedAt: null, territory: { not: null } },
      orderBy: { territory: "asc" },
      _count: { _all: true },
    });
    return groups.map(({ territory, _count }) => ({ territory, store_count: _count._all }));
  }
}
