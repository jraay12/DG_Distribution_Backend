export interface CustomerResponseDTO {
  id: string
  store_name: string
  owner_name: string
  address: string
  street?: string | null;
  barangay?: string | null;
  city_municipality?: string | null;
  province?: string | null;
  territory?: string | null;
  contact_number: string
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date | null
}