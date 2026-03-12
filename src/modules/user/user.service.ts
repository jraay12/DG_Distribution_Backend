import { CreateUserDTO } from "./dto/CreateUserDTO";
import { UserReponseDTO } from "./dto/UserResponseDTO";
import { UserRepository } from "./user.repository";
import { User } from "./user.entity";
import { Bcrypt } from "../../utils/bcrypt";
import { ConflictError } from "../../utils/error/ConflictError";
export class UserService {
  constructor(
    private userRepo: UserRepository,
    private bcrypt: Bcrypt,
  ) {}

  async createUser(data: CreateUserDTO): Promise<UserReponseDTO> {
    const emailExist = await this.userRepo.findByEmail(data.email);

    if (emailExist) throw new ConflictError("User already exists");

    const user = User.create(data);
    const hashPassword = await this.bcrypt.hash(user.password);
    user.setPassword(hashPassword);
    await this.userRepo.createUser(user);
    return user.toSafeObject();
  }
}
