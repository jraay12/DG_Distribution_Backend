import { BadRequestError } from "../../utils/error/BadRequestError";
import { NotFoundError } from "../../utils/error/NotFoundError";
import { TransactionRepository } from "./transaction.repository";
import { Transaction } from "./transaction.entity";
import { StoreVisitRepository } from "../store-visit/store-visit.repository";
import { TransactionType } from "./transaction.entity";
import { ProductRepository } from "../product/product.repository";
export class TransactionService {
  constructor(
    private transactionRepo: TransactionRepository,
    private storeVisitRepo: StoreVisitRepository,
    private productRepo: ProductRepository,
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

    await this.transactionRepo.save(transaction);

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
