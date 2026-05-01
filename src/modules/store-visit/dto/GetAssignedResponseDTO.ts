export interface GetAssignedResponseDTO {
  id: string
  customer_id: string
  store_name: string
  owner_name: string
  user_id: string
  visit_date: Date
  time_in?: string | null
  time_out?: string | null
  stay_duration: string | null
  status?: string
}