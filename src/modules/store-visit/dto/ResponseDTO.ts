export interface StoreVisitResponseDto {
  id: string;
  user_id: string;
  customer_id: string;
  visit_date: Date
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}