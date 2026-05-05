import crypto from "crypto";
import { BadRequestError } from "../../utils/error/BadRequestError";

export enum TransactionType {
  SALE = "SALE",
  DELIVERY = "DELIVERY",
}

export interface TransactionItemProps {
  id: string;
  transaction_id: string;
  product_id: string;
  quantity: number;
  price?: number;
}

export interface TransactionProps {
  id: string;
  store_visit_id: string;
  user_id: string;
  type: TransactionType;
  items: TransactionItemProps[];

  total_amount?: number;

  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export class Transaction {
  private props: TransactionProps;

  private constructor(props: TransactionProps) {
    this.props = {
      ...props,
      items: props.items ?? [],
      total_amount: props.total_amount ?? 0,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
      deletedAt: props.deletedAt ?? null,
    };
  }

  // CREATE
  static create(
    props: Omit<
      TransactionProps,
      "id" | "createdAt" | "updatedAt" | "deletedAt" | "total_amount"
    >
  ): Transaction {
    if (!props.store_visit_id) {
      throw new BadRequestError("Store Visit ID is required");
    }

    if (!props.user_id) {
      throw new BadRequestError("User ID is required");
    }

    if (!props.type) {
      throw new BadRequestError("Transaction type is required");
    }

    if (!props.items || props.items.length === 0) {
      throw new BadRequestError("At least one item is required");
    }

    return new Transaction({
      ...props,
      id: crypto.randomUUID(),
      total_amount: 0,
    });
  }

  // HYDRATE (from DB)
  static hydrate(props: TransactionProps): Transaction {
    return new Transaction(props);
  }

  // -------------------
  // GETTERS
  // -------------------
  get id(): string {
    return this.props.id;
  }

  get storeVisitId(): string {
    return this.props.store_visit_id;
  }

  get userId(): string {
    return this.props.user_id;
  }

  get type(): TransactionType {
    return this.props.type;
  }

  get items(): TransactionItemProps[] {
    return this.props.items;
  }

  get totalAmount(): number {
    return this.props.total_amount ?? 0;
  }

  get createdAt(): Date {
    return this.props.createdAt!;
  }

  get updatedAt(): Date {
    return this.props.updatedAt!;
  }

  get deletedAt(): Date | null {
    return this.props.deletedAt ?? null;
  }

  // -------------------
  // BEHAVIORS
  // -------------------

  addItem(item: Omit<TransactionItemProps, "id" | "transaction_id">) {
    if (this.props.deletedAt) {
      throw new BadRequestError("Cannot modify deleted transaction");
    }

    this.props.items.push({
      id: crypto.randomUUID(),
      transaction_id: this.props.id,
      ...item,
    });

    this.recalculateTotal();
    this.touch();
  }

  removeItem(itemId: string) {
    this.props.items = this.props.items.filter(i => i.id !== itemId);
    this.recalculateTotal();
    this.touch();
  }

  recalculateTotal() {
    this.props.total_amount = this.props.items.reduce((sum, item) => {
      const price = item.price ?? 0;
      return sum + price * item.quantity;
    }, 0);
  }

  softDelete() {
    this.props.deletedAt = new Date();
    this.touch();
  }

  restore() {
    this.props.deletedAt = null;
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  // -------------------
  // SERIALIZE
  // -------------------
  toJSON(): TransactionProps {
    return { ...this.props };
  }
}