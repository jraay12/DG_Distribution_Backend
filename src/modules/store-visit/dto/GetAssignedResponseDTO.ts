export interface GetAssignedResponseDTO {
  id: string
  customer_id: string
  store_name: string
  owner_name: string
  address: string
  territory: string | null
  inventory_counted: boolean
  order_id: string | null
  user_id: string
  visit_date: Date
  time_in?: string | null
  time_out?: string | null
  stay_duration: string | null
  status?: string
}