import { ExtendedPrismaClient } from "../../config/prisma";
import { BadRequestError } from "../../utils/error/BadRequestError";
import { NotFoundError } from "../../utils/error/NotFoundError";
import { CustomerRepository } from "../customer/customer.repository";
import { ProductRepository } from "../product/product.repository";
import { StockMovementRepository } from "../Stock Movement/stock-movement.repository";
import { StoreInventoryRepositiory } from "./store-inventory.repository";
import crypto from "crypto";

export class StoreInventoryService {
  constructor(
    private storeInventoryRepo: StoreInventoryRepositiory,
    private customerRepo: CustomerRepository,
    private productRepo: ProductRepository,
    private stockMovementRepo: StockMovementRepository,
    private prisma: ExtendedPrismaClient
  ) {}

  async create(data: {
    customer_id: string;
    product_id: string;
    quantity: number;
  }) {
    const existingCustomer = await this.customerRepo.findById(data.customer_id);
    if (!existingCustomer) throw new NotFoundError("Customer doesn't exists");

    const existingProduct = await this.productRepo.findById(data.product_id);
    if (!existingProduct) throw new NotFoundError("Product doesn't exists");

    if (data.quantity <= 0)
      throw new BadRequestError("Quantity must be greater or equal to 1");

    return await this.storeInventoryRepo.create({...data, id: crypto.randomUUID()})
  }
}
