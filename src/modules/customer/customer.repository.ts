import { ExtendedPrismaClient } from "../../config/prisma";
import { Customer } from "./customer.entity";

export class CustomerRepository {
  constructor(private prisma: ExtendedPrismaClient){}

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
        updatedAt: customer.updatedAt
      }
    })
  }
}