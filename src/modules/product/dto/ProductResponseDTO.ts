
export interface ProductResponseDTO {
  id: string
  
  model_id: string
  product_name: string
  category: string
  category_name?: string
  price: number
  created_by: string
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}