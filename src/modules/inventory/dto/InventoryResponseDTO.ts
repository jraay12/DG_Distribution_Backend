export interface InventoryResponseDTO {
  id: string
  quantity: number
  reorder_level?: number | null
  createdAt?: Date
  updatedAt?: Date
}