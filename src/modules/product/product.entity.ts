import crypto from "crypto";
import { BadRequestError } from "../../utils/error/BadRequestError";
import { ProductCategory } from "./product.enum";

export interface ProductProps {
  id: string;
  model_id: string;
  product_name: string;
  price: number;
  category: ProductCategory;
  created_by: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export class Product {
  private props: ProductProps;
  private static readonly MAX_PRODUCTNAME_LENGTH = 100;

  constructor(props: ProductProps) {
    this.props = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
      deletedAt: props.deletedAt ?? null,
    };
  }

  static create(
    props: Omit<ProductProps, "id" | "createdAt" | "updatedAt" | "deletedAt">,
  ) {
    if (!props.product_name || props.product_name.trim().length === 0)
      throw new BadRequestError("Product Name is required");

    if (props.product_name.trim().length > Product.MAX_PRODUCTNAME_LENGTH)
      throw new BadRequestError(
        `Product Name must not exceed ${Product.MAX_PRODUCTNAME_LENGTH} characters`,
      );

    if (!props.price || props.price <= 0)
      throw new BadRequestError("Price must be greater than 0");

    if (!props.model_id || props.model_id.trim().length === 0)
      throw new BadRequestError("Model ID is required");

    if (!props.category) throw new BadRequestError("Category is required");

    if (!Object.values(ProductCategory).includes(props.category))
      throw new BadRequestError("Invalid category");

    if (!props.created_by || props.created_by.trim().length === 0)
      throw new BadRequestError("Created by is required");

    return new Product({
      ...props,
      id: crypto.randomUUID(),
    });
  }

  static hydrate(props: ProductProps): Product {
    return new Product(props);
  }

  update(
    product_name: string,
    price: number,
    category: ProductCategory,
    model_id: string,
  ): void {
    if (!product_name || product_name.trim().length === 0)
      throw new BadRequestError("Product Name is required");

    if (product_name.trim().length > Product.MAX_PRODUCTNAME_LENGTH)
      throw new BadRequestError(
        `Product Name must not exceed ${Product.MAX_PRODUCTNAME_LENGTH} characters`,
      );

    if (!price || price <= 0)
      throw new BadRequestError("Price must be greater than 0");

    if (!category) throw new BadRequestError("Category is required");

    if (!Object.values(ProductCategory).includes(category))
      throw new BadRequestError("Invalid category");

    if (!model_id || model_id.trim().length === 0)
      throw new BadRequestError("Model ID is required");

    if (this.props.deletedAt)
      throw new BadRequestError("Cannot update deleted product");

    this.props.product_name = product_name;
    this.props.price = price;
    this.props.category = category;
    this.props.model_id = model_id;
    this.props.updatedAt = new Date();
  }

  delete(): void {
    if (this.props.deletedAt)
      throw new BadRequestError("Product is already deleted");

    this.props.deletedAt = new Date();
    this.props.updatedAt = new Date();
  }

  restore(): void {
    if (!this.props.deletedAt)
      throw new BadRequestError("Product is not deleted");

    this.props.deletedAt = null;
    this.props.updatedAt = new Date();
  }

  toJson() {
    return {
      id: this.props.id,
      model_id: this.props.model_id,
      product_name: this.props.product_name,
      price: this.props.price,
      category: this.props.category,
      created_by: this.props.created_by,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      deletedAt: this.props.deletedAt,
    };
  }

  // --- Getters ---
  get id(): string {
    return this.props.id;
  }

  get modelId(): string {
    return this.props.model_id;
  }

  get productName(): string {
    return this.props.product_name;
  }

  get price(): number {
    return this.props.price;
  }

  get category(): ProductCategory {
    return this.props.category;
  }

  get createdBy(): string {
    return this.props.created_by;
  }

  get createdAt(): Date {
    return this.props.createdAt!;
  }

  get updatedAt(): Date {
    return this.props.updatedAt!;
  }

  get deletedAt(): Date | null | undefined {
    return this.props.deletedAt;
  }

  get isDeleted(): boolean {
    return !!this.props.deletedAt;
  }

  get isActive(): boolean {
    return !this.props.deletedAt;
  }
}
