export interface CreateDeliveryReportDTO {
  user_id: string
  customer_id: string
  date: Date
  remarks?: string | null
  latitude: number
  longitude: number
  image_path: string
}