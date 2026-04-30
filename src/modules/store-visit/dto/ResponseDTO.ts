export interface StoreVisitResponseDto {
  id: string;
  user_id: string;
  customer_id: string;
  visted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}