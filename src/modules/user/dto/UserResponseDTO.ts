import { UserRole } from "../user.entity"

export interface UserReponseDTO {
  id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface PaginatedUserResponseDTO {
  data: UserReponseDTO[],
  meta: {
    page: number
    limit: number
    totalPage: number
    total: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}