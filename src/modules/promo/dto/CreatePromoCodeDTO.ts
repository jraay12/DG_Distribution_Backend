export interface CreatePromoCodeDto {
  code: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  maxUsage?: number;
  expiresAt?: Date;
}