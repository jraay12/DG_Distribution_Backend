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
export class TransactionService {
  constructor(
    private transactionRepo: TransactionRepository,
    private storeVisitRepo: StoreVisitRepository,
    private productRepo: ProductRepository,
    private inventoryRepo: InventoryRepository,
    private stockMovementRepo: StockMovementRepository,
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

    // 1. Validate store visit exists
    const visit = await this.storeVisitRepo.findById(dto.store_visit_id);

    if (!visit) {
      throw new NotFoundError("Store visit not found");
    }

    // Merge duplicate products
    const combinedDuplicateEntries = new Map<
      string,
      {
        product_id: string;
        quantity: number;
        price?: number;
      }
    >();

    for (const item of dto.items) {
      const existing = combinedDuplicateEntries.get(item.product_id);

      if (existing) {
        combinedDuplicateEntries.set(item.product_id, {
          product_id: item.product_id,
          quantity: existing.quantity + item.quantity,
        });
      } else {
        combinedDuplicateEntries.set(item.product_id, {
          product_id: item.product_id,
          quantity: item.quantity,
        });
      }
    }

    const convertItemToArray = Array.from(combinedDuplicateEntries.values());

    const productIds = convertItemToArray.map((item) => item.product_id);

    const products = await this.productRepo.findByManyIds(productIds);

    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

    for (const item of convertItemToArray) {
      const product = productMap.get(item.product_id);

      if (!product)
        throw new NotFoundError(`Product not found: ${item.product_id}`);

      const stock = product.inventory?.quantity;

      if (stock === undefined) {
        throw new BadRequestError(
          `No inventory found for product: ${item.product_id}`,
        );
      }

      if (stock < item.quantity) {
        throw new BadRequestError(
          `Insufficient stock for product: ${product.product_name}`,
        );
      }
    }

    // 2. Create transaction entity
    const transaction = Transaction.create({
      store_visit_id: dto.store_visit_id,
      user_id: dto.user_id,
      type: dto.type,
      items: convertItemToArray.map((item) => {
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
    await this.prisma.$transaction(async (tx) => {
      await this.transactionRepo.save(transaction, tx as typeof this.prisma);

      for (const item of convertItemToArray) {
        const updated = await this.inventoryRepo.deductStockAtomic(
          item.product_id,
          item.quantity,
          tx as typeof this.prisma,
        );

        updatedInventories.push({
          productId: updated?.product_id,
          quantity: updated?.quantity
        })
      }

      await this.stockMovementRepo.createMany(
        convertItemToArray.map((item) =>
          StockMovement.create({
            type: Type.OUT,
            product_id: item.product_id,
            quantity: item.quantity,
            created_by: dto.user_id,
          }),
        ),
        tx as typeof this.prisma,
      );
    });

    updatedInventories.forEach(inventory => {
      emitProductInventory(inventory)
    })

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
