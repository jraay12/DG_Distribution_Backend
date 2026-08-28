import { ExtendedPrismaClient } from "../../config/prisma";
import { BadRequestError } from "../../utils/error/BadRequestError";
import { NotFoundError } from "../../utils/error/NotFoundError";
import { CustomerRepository } from "../customer/customer.repository";
import { ProductRepository } from "../product/product.repository";
import { StockMovementRepository } from "../Stock Movement/stock-movement.repository";
import { GetStoreInventoriesResponseDTO } from "./dto/GetStoreInventoriesResponseDTO";
import { StoreInventoryRepositiory } from "./store-inventory.repository";
import crypto from "crypto";
import { StockMovement } from "../Stock Movement/stock-movement.entity";
import { Type } from "../Stock Movement/stock-movement.enum";
import { emitStoreInventory } from "../../utils/socket/socket.publisher";
import { StoreVisitRepository } from "../store-visit/store-visit.repository";
import { ForbiddenError } from "../../utils/error/ForbiddenError";

export class StoreInventoryService {
  constructor(
    private storeInventoryRepo: StoreInventoryRepositiory,
    private customerRepo: CustomerRepository,
    private productRepo: ProductRepository,
    private stockMovementRepo: StockMovementRepository,
    private prisma: ExtendedPrismaClient,
    private storeVisitRepo: StoreVisitRepository,
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

  async adjustStock(data: {
    customer_id: string;
    product_id: string;
    quantity: number;
    type: "IN" | "OUT";
    user_id: string;
    role: string;
    store_visit_id?: string;
  }) {
    const customer = await this.customerRepo.findById(data.customer_id);
    if (!customer) throw new NotFoundError("Customer doesn't exist");
    const product = await this.productRepo.findById(data.product_id);
    if (!product || product.isDeleted) throw new NotFoundError("Product doesn't exist");
    if (!Number.isInteger(data.quantity) || data.quantity <= 0) {
      throw new BadRequestError("Quantity must be a positive integer");
    }
    if (!["IN", "OUT"].includes(data.type)) throw new BadRequestError("Type must be IN or OUT");
    if (data.role === "USER") {
      if (!data.store_visit_id) throw new BadRequestError("Store visit is required for agent stock updates");
      const visit = await this.storeVisitRepo.findById(data.store_visit_id);
      if (!visit) throw new NotFoundError("Store visit not found");
      if (visit.userId !== data.user_id || visit.customerId !== data.customer_id) {
        throw new ForbiddenError("You can only update stock for your own assigned store visit");
      }
    }

    const updated = await this.prisma.$transaction(async tx => {
      const inventory = data.type === "IN"
        ? await this.storeInventoryRepo.increaseStock(data.customer_id, data.product_id, data.quantity, tx as typeof this.prisma)
        : await this.storeInventoryRepo.decreaseStock(data.customer_id, data.product_id, data.quantity, tx as typeof this.prisma);
      if (!inventory) throw new BadRequestError("Insufficient store stock");
      await this.stockMovementRepo.save(StockMovement.create({
        product_id: data.product_id,
        store_id: data.customer_id,
        type: data.type === "IN" ? Type.IN : Type.OUT,
        quantity: data.quantity,
        created_by: data.user_id,
      }), tx as typeof this.prisma);
      return inventory;
    });

    emitStoreInventory({
      product_id: updated.product_id,
      customer_id: updated.customer_id,
      quantity: updated.quantity,
    });
    return updated;
  }
}
