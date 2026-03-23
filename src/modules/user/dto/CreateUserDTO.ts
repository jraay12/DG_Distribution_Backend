import { UserRole } from "../user.entity";

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: UserRole
}
