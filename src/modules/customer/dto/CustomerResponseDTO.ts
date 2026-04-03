export interface CustomerResponseDTO {
  id: string
  store_name: string
  owner_name: string
  address: string
  contact_number: string
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date | null
}