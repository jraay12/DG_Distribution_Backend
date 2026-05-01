export interface CreateDeliveryReportDTO {
  store_visit_id: string
  date: Date
  remarks?: string | null
  latitude: number
  longitude: number
  image_path: string
}