import { ExtendedPrismaClient } from "../../config/prisma";
import { BadRequestError } from "../../utils/error/BadRequestError";
import { NotFoundError } from "../../utils/error/NotFoundError";
import { CustomerRepository } from "../customer/customer.repository";
import { ProductRepository } from "../product/product.repository";
import { StockMovementRepository } from "../Stock Movement/stock-movement.repository";
import { GetStoreInventoriesResponseDTO } from "./dto/GetStoreInventoriesResponseDTO";
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

  async getStoreInventories(customer_id: string): Promise<GetStoreInventoriesResponseDTO[]>{
    const existingCustomer = await this.customerRepo.findById(customer_id);
    if (!existingCustomer) throw new NotFoundError("Customer doesn't exists");

    const records = await this.storeInventoryRepo.findInventoriesByCustomerId(customer_id)

    return records.map((record) => ({
      id: record.id,
      customer_id: record.customer_id,
      owner_name: record.customer.owner_name,
      store_name: record.customer.store_name,
      product_name: record.product.product_name,
      quantity: record.quantity,
      product_id: record.product_id
    }))
  }

  async getTopProducts(customer_id: string) {
    const existingCustomer = await this.customerRepo.findById(customer_id);
    if (!existingCustomer) throw new NotFoundError("Customer doesn't exists");

    const topProducts = await this.stockMovementRepo.getTopOutMovements(customer_id)

    const productIds = topProducts.map(product => product.product_id)

    const products = await this.productRepo.findByManyIds(productIds)

    return topProducts.map(m => {
      const product = products.find(p => p.id === m.product_id)

      return {
        product_id: m.product_id,
        product_name: product?.product_name,
        total_sold: m._sum.quantity
      }
    })
  }
}
