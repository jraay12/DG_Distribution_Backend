import { requiredText } from "../../utils/input";
import { ForbiddenError } from "../../utils/error/ForbiddenError";
import { CreateUserDTO } from "./dto/CreateUserDTO";
import { PaginatedUserResponseDTO, UserReponseDTO } from "./dto/UserResponseDTO";
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
    if (typeof data?.oldPassword !== "string" || !data.oldPassword ||
        typeof data.newPassword !== "string" || data.newPassword.length < 8 ||
        Buffer.byteLength(data.newPassword, "utf8") > 72) {
      throw new BadRequestError("Provide the current password and a new password with at least 8 characters and at most 72 bytes");
    }
    const user = await this.userRepo.findById(user_id);
    if (!user) throw new NotFoundError("User not found");
    if (!user.isActive) throw new ForbiddenError("Your account is not activated");
    if (!await this.bcrypt.compare(data.oldPassword, user.password)) {
      throw new BadRequestError("Current password is incorrect");
    }
    const hashedPassword = await this.bcrypt.hash(data.newPassword);
    if (!await this.userRepo.updatePassword(user_id, user.password, hashedPassword)) {
      throw new ConflictError("The account changed while updating the password. Retry with your current password.");
    }
  }

  async updateMe(user_id: string, data: { name?: unknown; email?: unknown }) {
    if (data?.name === undefined && data?.email === undefined) {
      throw new BadRequestError("Provide a name or email");
    }
    const user = await this.userRepo.findById(user_id);
    if (!user) throw new NotFoundError("User not found");
    if (!user.isActive) throw new ForbiddenError("Your account is not activated");
    const changes: { name?: string; email?: string } = {};
    if (data.name !== undefined) {
      user.updateName(requiredText(data.name, "name"));
      changes.name = user.name;
    }
    if (data.email !== undefined) {
      user.updateEmail(requiredText(data.email, "email"));
      const duplicate = await this.userRepo.findByEmail(user.email);
      if (duplicate && duplicate.id !== user_id) throw new ConflictError("Email already exists");
      changes.email = user.email;
    }
    try {
      return await this.userRepo.updateProfile(user_id, changes);
    } catch (error) {
      if (typeof error === "object" && error && "code" in error && error.code === "P2025") {
        throw new ConflictError("The account changed while updating the profile");
      }
      throw error;
    }
  }

  async activateUser(data: { user_id: string }): Promise<UserReponseDTO> {
    const user = await this.userRepo.findById(data.user_id);
    if (!user) throw new NotFoundError("User not found");

    user.activate();

    await this.userRepo.update(user);

    return user.toSafeObject();
  }

  async deactivateUser(data: { user_id: string }): Promise<UserReponseDTO> {
    const user = await this.userRepo.findById(data.user_id);
    if (!user) throw new NotFoundError("User not found");

    user.deactivate();

    await this.userRepo.update(user);

    return user.toSafeObject();
  }

  async updateUser(data: {
    name: string;
    email: string;
    role?: "ADMIN" | "USER";
    user_id: string;
  }): Promise<UserReponseDTO> {
    const user = await this.userRepo.findById(data.user_id);
    if (!user) throw new NotFoundError("User not found");

    const findByEmail = await this.userRepo.findByEmail(data.email);
    if (findByEmail && findByEmail.id !== data.user_id) {
      throw new ConflictError("Email already exist");
    }

    user.updateEmail(data.email);
    user.updateName(data.name);
    if (data.role) user.changeRole(data.role);

    await this.userRepo.update(user);

    return user.toSafeObject();
  }

  async getMe(user_id: string): Promise<UserReponseDTO> {
    const user = await this.userRepo.findById(user_id);
    if (!user) throw new NotFoundError("User not found");
    if (!user.isActive) throw new ForbiddenError("Your account is not activated");

    return user.toSafeObject();
  }

  async getUsers(
    page: number = 1,
    limit: number = 10,
    status: "active" | "inactive" | "all" = "all",
  ): Promise<PaginatedUserResponseDTO> {
    const [data, total] = await Promise.all([
      this.userRepo.getUsers(page, limit, status),
      this.userRepo.userCount(status),
    ]);
    const totalPage = Math.ceil(total / limit);
    const hasNextPage = page < totalPage;
    const hasPrevPage = page > 1;

    return {
      data: data,
      meta: {
        limit,
        page, 
        total,
        totalPage,
        hasNextPage,
        hasPrevPage
      }
    }
  }
}
