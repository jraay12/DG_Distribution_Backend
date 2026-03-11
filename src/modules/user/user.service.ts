import { CreateUserDTO } from "./dto/CreateUserDTO";
import { UserReponseDTO } from "./dto/UserResponseDTO";
import { UserRepository } from "./user.repository";
import { User } from "./user.entity";
export class UserService {
  constructor(private userRepo: UserRepository) {}

  async createUser(data: CreateUserDTO): Promise<UserReponseDTO> {
    const user = User.create(data);

    await this.userRepo.createUser(user);
    return user.toSafeObject()
  }
}
