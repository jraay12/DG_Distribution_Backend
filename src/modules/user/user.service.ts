import { CreateUserDTO } from "./dto/CreateUserDTO";
import { UserReponseDTO } from "./dto/UserResponseDTO";
import { UserRepository } from "./user.repository";
import { User } from "./user.entity";
import { Bcrypt } from "../../utils/bcrypt";
import { ConflictError } from "../../utils/error/ConflictError";
import { NotFoundError } from "../../utils/error/NotFoundError";
import { ChangePasswordDTO } from "./dto/ChangePasswordDTO";
import { BadRequestError } from "../../utils/error/BadRequestError";
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

  async updatePassword(
    user_id: string,
    data: ChangePasswordDTO,
  ): Promise<void> {
    const user = await this.userRepo.findById(user_id);

    if (!user) throw new NotFoundError("User not found!");

    const passwordMatch = await this.bcrypt.compare(
      data.oldPassword,
      user.password,
    );

    if (!passwordMatch) throw new BadRequestError("Old password not match");

    user.updatePassword(data.newPassword);
    const hashedPassword = await this.bcrypt.hash(data.newPassword);
    await this.userRepo.updatePassword(user_id, hashedPassword);
  }
}
