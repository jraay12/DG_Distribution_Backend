import { ExtendedPrismaClient } from "../../config/prisma";
import { Customer } from "./customer.entity";

export class CustomerRepository {
  constructor(private prisma: ExtendedPrismaClient) {}

  async save(customer: Customer): Promise<void> {
    await this.prisma.customer.create({
      data: {
        id: customer.id,
        contact_number: customer.contactNumber,
        address: customer.address,
        owner_name: customer.ownerName,
        store_name: customer.storeName,
        createdAt: customer.createdAt,
        deletedAt: customer.deletedAt,
        updatedAt: customer.updatedAt,
      },
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
    await this.prisma.customer.update({
      where: {
        id: customer.id,
      },
      data: {
        address: customer.address,
        contact_number: customer.contactNumber,
        owner_name: customer.ownerName,
        store_name: customer.storeName,
        updatedAt: customer.updatedAt
      },
    });
  }

  async delete(customer_id: string): Promise<void> {
    await this.prisma.customer.delete({
      where: {
        id: customer_id
      }
    })
  }

  async restore(customer_id: string): Promise<void> {
    await this.prisma.customer.update({
      where: {
        id: customer_id
      },
      data: {
        deletedAt: null
      }
    })
  }

  async getCustomers(status: "all" | "active" | "deleted" = "active"): Promise<Customer[]> {

    const whereClause: any = {}

    if(status){
      whereClause.deletedAt = status === 'active' ? null : status === "deleted" ? {not: null} : undefined
    }
    

    const customers = await this.prisma.customer.findMany({
      where: whereClause
    })

    return customers.map(customer => Customer.hydrate(customer))
  }
}
