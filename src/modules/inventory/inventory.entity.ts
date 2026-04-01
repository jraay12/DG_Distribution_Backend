import { BadRequestError } from "../../utils/error/BadRequestError";
import crypto from "crypto";
export interface InventoryProps {
  id: string;
  product_id: string;
  quantity: number;
  reorder_level?: number | null;
  updatedAt?: Date;
  createdAt?: Date;
}

export class Inventory {
  private props: InventoryProps;

  constructor(props: InventoryProps) {
    this.props = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };
  }

  addStock(data: { quantity: number; reorder_level?: number | null }) {
    if (data.quantity <= 0)
      throw new BadRequestError("Quantity must be greater than zero");

    this.props.quantity += data.quantity;

    if (data.reorder_level !== undefined) {
      this.props.reorder_level = data.reorder_level;
    }

    this.props.updatedAt = new Date();
  }

  static hydrate(props: InventoryProps): Inventory {
    return new Inventory(props);
  }

  toJson() {
    return {
      id: this.id,
      product_id: this.props.product_id,
      reorder_level: this.props.reorder_level,
      quantity: this.props.quantity,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }

  // Getters

  get id() {
    return this.props.id;
  }

  get productId() {
    return this.props.product_id;
  }

  get quantity() {
    return this.props.quantity;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get reorderLevel() {
    return this.props.reorder_level;
  }
}
