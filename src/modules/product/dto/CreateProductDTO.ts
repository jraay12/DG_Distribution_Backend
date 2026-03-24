import { ProductCategory } from "../product.enum"

export interface CreateProductDTO {
  price: number
  category: ProductCategory
  model_id: string
  product_name: string
  created_by: string

}