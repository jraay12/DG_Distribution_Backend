import { ProductCategory } from "../product.enum"

export interface ProductResponseDTO {
  id: string
  
  model_id: string
  product_name: string
  category: ProductCategory
  price: number
  created_by: string
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}