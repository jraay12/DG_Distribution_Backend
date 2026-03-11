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