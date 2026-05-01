export interface PromoCodeResponseDto {
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