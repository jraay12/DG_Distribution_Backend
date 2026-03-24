import { BadRequestError } from "../../utils/error/BadRequestError";
import crypto from "crypto";

export interface BrandProps {
  id: string;
  brand_name: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export class Brand {
  private props: BrandProps;
  private static readonly MAX_BRANDNAME_LENGTH = 100;
  constructor(props: BrandProps) {
    this.props = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };
  }

  static create(
    props: Omit<BrandProps, "id" | "createdAt" | "updatedAt" | "deletedAt">,
  ): Brand {
    if (!props.brand_name || props.brand_name.trim().length === 0)
      throw new BadRequestError("Brand Name is required!");

    if (props.brand_name.trim().length > this.MAX_BRANDNAME_LENGTH)
      throw new BadRequestError(
        `Brand Name must not exceed ${this.MAX_BRANDNAME_LENGTH} characters`,
      );

    return new Brand({ ...props, id: crypto.randomUUID() });
  }

  static hydrate(props: BrandProps): Brand {
    return new Brand(props)
  }

  toJson() {
    return {
      id: this.id,
      brand_name: this.props.brand_name,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      deletedAt: this.props.deletedAt,
    };
  }

  softDelete(): void {
    if (this.props.deletedAt) throw new BadRequestError("Brand already delelete")

    this.props.deletedAt = new Date()
  }

  updateName(brand_name: string): void {
    if (!brand_name || brand_name.trim().length === 0) throw new BadRequestError("Brand Name is required")

    if(this.props.deletedAt) throw new BadRequestError("Cannot update deleted brand")

    if (brand_name.trim().length > Brand.MAX_BRANDNAME_LENGTH) throw new BadRequestError(`Brand Name must not exceed ${Brand.MAX_BRANDNAME_LENGTH} characters`)

    this.props.brand_name = brand_name
    this.props.updatedAt = new Date()
  }

  restore(): void {
    if (!this.props.deletedAt) throw new BadRequestError("Brand is not deleted")

    this.props.deletedAt = null
  }

  toSafeObject(): BrandProps {
      return this.props
    }

  // Getters
  get id() {
    return this.props.id;
  }

  get brand_name() {
    return this.props.brand_name;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updateAt() {
    return this.props.updatedAt;
  } 

  get isDeleted() { return !!this.props.deletedAt; }
}
