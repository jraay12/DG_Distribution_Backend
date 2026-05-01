import { BadRequestError } from "../../utils/error/BadRequestError";
import crypto from "crypto";

export interface PromoCodeProps {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  maxUsage?: number | null;
  usedCount?: number;
  expiresAt?: Date | null;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class PromoCode {
  private props: PromoCodeProps;
  private static readonly MAX_PROMO_CODE_LENGHT = 100;
  constructor(props: PromoCodeProps) {
    this.props = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };
  }

  static create(
    props: Omit<
      PromoCodeProps,
      "id" | "createdAt" | "updatedAt" | "usedCount" | "isActive"
    >,
  ) {
    const ALLOWED_DISCOUNT_TYPES = ["PERCENTAGE", "FIXED_AMOUNT"];
    if (!props.code || props.code.trim().length === 0)
      throw new Error("Promo Code is required");

    if (props.code.trim().length > PromoCode.MAX_PROMO_CODE_LENGHT)
      throw new Error(
        `Promo Code must not exceed ${PromoCode.MAX_PROMO_CODE_LENGHT} characters`,
      );

    if (!ALLOWED_DISCOUNT_TYPES.includes(props.discountType))
      throw new BadRequestError("Invalid Discount Type");

    if (!props.discountValue)
      throw new BadRequestError("Discount value is required");

    if (props.discountValue && props.discountValue <= 0)
      throw new BadRequestError("Value must be greater than 0");

    return new PromoCode({
      ...props,
      id: crypto.randomUUID(),
    });
  }

  static hydrate(props: PromoCodeProps): PromoCode {
    return new PromoCode(props);
  }

  disablePromoCode(): void {
    if (!this.props.isActive)
      throw new BadRequestError(
        "Cannot disable this promo code since it's already disabled",
      );

    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

   enablePromoCode(): void {
    if (this.props.isActive)
      throw new BadRequestError(
        "Cannot activate this promo code since it's already activated",
      );

    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  toJson() {
    return {
      id: this.props.id,
      code: this.props.code,
      discountType: this.props.discountType,
      discountValue: this.props.discountValue,
      maxUsage: this.props.maxUsage,
      usedCount: this.props.usedCount,
      expiresAt: this.props.expiresAt,
      isActive: this.props.isActive,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }

  get id(): string {
    return this.props.id;
  }

  get code(): string {
    return this.props.code;
  }

  get discountType(): "PERCENTAGE" | "FIXED_AMOUNT" {
    return this.props.discountType;
  }

  get discountValue(): number {
    return this.props.discountValue;
  }

  get maxUsage(): number | null | undefined {
    return this.props.maxUsage;
  }

  get usedCount(): number {
    return this.props.usedCount ?? 0;
  }

  get expiresAt(): Date | null | undefined {
    return this.props.expiresAt;
  }

  get isActive(): boolean {
    return this.props.isActive ?? true;
  }

  get createdAt(): Date {
    return this.props.createdAt!;
  }

  get updatedAt(): Date {
    return this.props.updatedAt!;
  }
}
