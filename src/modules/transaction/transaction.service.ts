import { BadRequestError } from "../../utils/error/BadRequestError";
import { NotFoundError } from "../../utils/error/NotFoundError";
import { TransactionRepository } from "./transaction.repository";
import { Transaction } from "./transaction.entity";
import { StoreVisitRepository } from "../store-visit/store-visit.repository";
import { TransactionType } from "./transaction.entity";
import { ProductRepository } from "../product/product.repository";
import { InventoryRepository } from "../inventory/inventory.repository";
import { ExtendedPrismaClient } from "../../config/prisma";
import { StockMovementRepository } from "../Stock Movement/stock-movement.repository";
import { StockMovement } from "../Stock Movement/stock-movement.entity";
import { Type } from "../Stock Movement/stock-movement.enum";
import { emitProductInventory } from "../../utils/socket/socket.publisher";
import { StoreInventoryRepositiory } from "../inventory/store-inventory.repository";
export class TransactionService {
  constructor(
    private transactionRepo: TransactionRepository,
    private storeVisitRepo: StoreVisitRepository,
    private productRepo: ProductRepository,
    private inventoryRepo: InventoryRepository,
    private stockMovementRepo: StockMovementRepository,
    private storeInventoryRepo: StoreInventoryRepositiory,
    private prisma: ExtendedPrismaClient,
  ) {}

  async create(dto: {
    store_visit_id: string;
    user_id: string;
    type: TransactionType;
    items: {
      product_id: string;
      quantity: number;
    }[];
  }) {
    if (!dto.store_visit_id) {
      throw new BadRequestError("Store visit is required");
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestError("Transaction must have at least one item");
    }

    // 1. Validate store visit
    const visit = await this.storeVisitRepo.findById(dto.store_visit_id);
    if (!visit) {
      throw new NotFoundError("Store visit not found");
    }

    // 2. Merge duplicate items
    const merged = new Map<string, { product_id: string; quantity: number }>();

    for (const item of dto.items) {
      const existing = merged.get(item.product_id);

      if (existing) {
        merged.set(item.product_id, {
          product_id: item.product_id,
          quantity: existing.quantity + item.quantity,
        });
      } else {
        merged.set(item.product_id, item);
      }
    }

    const items = Array.from(merged.values());
    const productIds = items.map((i) => i.product_id);

    // 3. Load products
    const products = await this.productRepo.findByManyIds(productIds);
    const productMap = new Map(products.map((p) => [p.id, p]));

    // 4. Validate stock based on TYPE
    if (dto.type === TransactionType.SALE) {
      // check STORE stock
      for (const item of items) {
        const storeInventory =
          await this.storeInventoryRepo.findByStoreAndProduct(
            visit.customerId,
            item.product_id,
          );

        if (!storeInventory) {
          throw new BadRequestError(
            `No store stock for product ${item.product_id}`,
          );
        }

        if (storeInventory.quantity < item.quantity) {
          throw new BadRequestError(`Insufficient store stock`);
        }
      }
    }

    if (dto.type === TransactionType.DELIVERY) {
      // check WAREHOUSE stock
      for (const item of items) {
        const product = productMap.get(item.product_id);

        if (!product) {
          throw new NotFoundError(`Product not found: ${item.product_id}`);
        }

        const stock = product.inventory?.quantity;

        if (!stock || stock < item.quantity) {
          throw new BadRequestError(`Insufficient warehouse stock`);
        }
      }
    }

    // 5. Create transaction entity
    const transaction = Transaction.create({
      store_visit_id: dto.store_visit_id,
      user_id: dto.user_id,
      type: dto.type,
      items: items.map((item) => {
        const product = productMap.get(item.product_id)!;

        return {
          id: crypto.randomUUID(),
          transaction_id: "",
          product_id: item.product_id,
          quantity: item.quantity,
          price: product.price.toNumber() * item.quantity,
        };
      }),
    });

    const updatedInventories: any[] = [];

    // 6. EXECUTE TRANSACTION
    await this.prisma.$transaction(async (tx) => {
      // save transaction
      await this.transactionRepo.save(transaction, tx as typeof this.prisma);

      // =========================
      // SALE FLOW (STORE → CUSTOMER)
      // =========================
      if (dto.type === TransactionType.SALE) {
        for (const item of items) {
          const updated = await this.storeInventoryRepo.decreaseStock(
            visit.customerId,
            item.product_id,
            item.quantity,
            tx as typeof this.prisma,
          );

          updatedInventories.push({
            productId: updated.product_id,
            quantity: updated.quantity,
          });
        }

        await this.stockMovementRepo.createMany(
          items.map((item) =>
            StockMovement.create({
              type: Type.OUT,
              product_id: item.product_id,
              store_id: visit.customerId,
              quantity: item.quantity,
              created_by: dto.user_id,
            }),
          ),
          tx as typeof this.prisma,
        );
      }

      // =========================
      // DELIVERY FLOW (WAREHOUSE → STORE)
      // =========================
      if (dto.type === TransactionType.DELIVERY) {
        for (const item of items) {
          // 1. deduct warehouse stock
          await this.inventoryRepo.deductStockAtomic(
            item.product_id,
            item.quantity,
            tx as typeof this.prisma,
          );

          // 2. increase store stock (UPSERT)
          const updated = await this.storeInventoryRepo.increaseStock(
            visit.customerId,
            item.product_id,
            item.quantity,
            tx as typeof this.prisma,
          );

          updatedInventories.push({
            productId: updated.product_id,
            quantity: updated.quantity,
          });

          // 3. stock movement (STORE IN)

          await this.stockMovementRepo.createMany(
            [
              // warehouse OUT
              ...items.map((item) =>
                StockMovement.create({
                  type: Type.OUT,
                  product_id: item.product_id,
                  quantity: item.quantity,
                  created_by: dto.user_id,
                }),
              ),

              // store IN
              ...items.map((item) =>
                StockMovement.create({
                  type: Type.IN,
                  product_id: item.product_id,
                  store_id: visit.customerId,
                  quantity: item.quantity,
                  created_by: dto.user_id,
                }),
              ),
            ],
            tx as typeof this.prisma,
          );
        }
      }
    });

    // 7. Emit updates
    updatedInventories.forEach((inv) => {
      emitProductInventory(inv);
    });

    return transaction.toJSON();
  }

  async getById(id: string) {
    const transaction = await this.transactionRepo.findById(id);

    if (!transaction) {
      throw new NotFoundError("Transaction not found");
    }

    return transaction;
  }

  async getByStoreVisit(storeVisitId: string) {
    const store_visit = await this.storeVisitRepo.findById(storeVisitId);

    if (!store_visit) throw new NotFoundError("Store visit not found");

    const record = await this.transactionRepo.findByStoreVisit(storeVisitId);

    return record.flat();
  }
}
