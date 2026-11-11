import { requiredText } from "../../utils/input";
import { productQuantities } from "../../utils/product-quantities";
import { ConflictError } from "../../utils/error/ConflictError";
import { Payload } from "../../utils/jwt";
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

  async submitVisitCount(customer_id: string, input: { store_visit_id?: unknown; items?: unknown }, requester: Payload) {
    const store_visit_id = requiredText(input?.store_visit_id, "store_visit_id");
    const counts = productQuantities(input?.items, true);
    return this.prisma.$transaction(async (transaction) => {
      const tx = transaction as ExtendedPrismaClient;
      const [visit] = await this.storeVisitRepo.lockForOrdering(store_visit_id, tx);
      if (!visit || visit.customer_id !== customer_id) throw new NotFoundError("Store visit not found");
      if (visit.user_id !== requester.user_id) throw new ForbiddenError("This visit is assigned to another agent");
      if (!visit.time_in) throw new ConflictError("Check in before counting store inventory");
      if (await tx.customerOrder.findUnique({ where: { store_visit_id }, select: { id: true } })) {
        throw new ConflictError("The customer order for this visit is already final");
      }
      const ids = [...counts.keys()];
      const products = await tx.product.findMany({
        where: { id: { in: ids }, deletedAt: null },
        select: { id: true },
      });
      if (products.length !== ids.length) throw new NotFoundError("One or more active products were not found");

      const now = new Date();
      const since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const movements = await this.stockMovementRepo.getRecentStoreDemand(customer_id, ids, since, now, tx);
      const demand = new Map(movements.map((item) => [item.product_id, item._sum.quantity ?? 0]));
      const items = ids.map((product_id) => {
        const quantity = counts.get(product_id)!;
        const recent_units_out = Math.min(demand.get(product_id) ?? 0, 2147483647);
        return {
          store_visit_id, product_id, quantity, recent_units_out,
          suggested_quantity: Math.max(0, recent_units_out - quantity),
        };
      });
      const saved = await this.storeInventoryRepo.replaceVisitCount(store_visit_id, items, tx);
      return this.formatVisitCount(saved);
    });
  }

  async getVisitCount(customer_id: string, visitId: unknown, requester: Payload) {
    const store_visit_id = requiredText(visitId, "store_visit_id");
    const visit = await this.storeVisitRepo.findById(store_visit_id);
    if (!visit || visit.deletedAt || visit.customerId !== customer_id) throw new NotFoundError("Store visit not found");
    if (requester.role === "USER" && visit.userId !== requester.user_id) {
      throw new ForbiddenError("This visit is assigned to another agent");
    }
    return this.formatVisitCount(await this.storeInventoryRepo.findVisitCount(store_visit_id));
  }

  async getRecommendations(customer_id: string, visitId: unknown, requester: Payload) {
    if (requester.role === "ADMIN" && visitId === undefined) {
      return this.getTopProducts(customer_id);
    }
    const items = await this.getVisitCount(customer_id, visitId, requester);
    if (!items.length) throw new ConflictError("Submit store inventory before requesting suggestions");
    return items.filter((item) => item.suggested_quantity > 0 && item.active);
  }

  private formatVisitCount(items: Awaited<ReturnType<StoreInventoryRepositiory["findVisitCount"]>>) {
    return items.map(({ product, ...item }) => ({
      ...item,
      product_name: product.product_name,
      active: product.deletedAt === null,
    }));
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
