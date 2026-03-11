import { CreateUserDTO } from "./dto/CreateUserDTO";
import { UserReponseDTO } from "./dto/UserResponseDTO";
import { UserRepository } from "./user.repository";
import { User } from "./user.entity";
import { Bcrypt } from "../../utils/bcrypt";
export class UserService {
  constructor(
    private userRepo: UserRepository,
    private bcrypt: Bcrypt,
  ) {}

  async createUser(data: CreateUserDTO): Promise<UserReponseDTO> {
    const user = User.create(data);
    const hashPassword = await this.bcrypt.hash(user.password);
    user.setPassword(hashPassword);
    await this.userRepo.createUser(user);
    return user.toSafeObject();
  }
}
