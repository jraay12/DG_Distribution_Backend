import { ProductCategory } from "../product.enum"

export interface ProductWithModelResponseDTO {
  id: string
  product_name: string
  model_name: string
  model_id: string
  category: ProductCategory
  price: number
  created_by: string
  stock: number
  reorder_level?: number | null
}

export interface PaginatedProductResponseDTO {
  data: ProductWithModelResponseDTO[],
  meta: {
    page: number
    limit: number
    totalPage: number
    total: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}