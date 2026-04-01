import { ProductCategory } from "../product.enum";

export interface UpdateProductDTO {
  category: ProductCategory
  price: number
  product_name: string
  model_id: string
}