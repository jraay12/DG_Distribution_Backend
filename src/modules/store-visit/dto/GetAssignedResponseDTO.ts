export interface GetAssignedResponseDTO {
  id: string
  customer_id: string
  store_name: string
  owner_name: string
  user_id: string
  visit_date: Date
  time_in?: Date | null
  time_out?: Date | null
}