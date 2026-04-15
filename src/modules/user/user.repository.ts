import { User } from "./user.entity";
import { ExtendedPrismaClient } from "../../config/prisma";
import { UserReponseDTO } from "./dto/UserResponseDTO";
export class UserRepository {
  constructor(private prisma: ExtendedPrismaClient) {}

  async createUser(user: User): Promise<void> {
    await this.prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  }

  async findById(user_id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: user_id,
      },
    });

    if (!user) return null;

    return User.reconstitute(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) return null;

    return User.reconstitute(user);
  }

  async updatePassword(user_id: string, newPassword: string): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: user_id,
      },
      data: {
        password: newPassword,
      },
    });
  }

  async update(user: User): Promise<void> {
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.email,
        isActive: user.isActive,
        name: user.name,
        role: user.role,
      },
    });
  }

  async getUsers(
    page: number,
    limit: number,
  ): Promise<UserReponseDTO[]> {
    const skip = (page - 1) * limit;

    const whereClause: any = { isActive: true };
 
    const users = await this.prisma.user.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      where: whereClause
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
  }

  async userCount(tx?: typeof this.prisma): Promise<number> {
    const client = (tx ?? this.prisma) as ExtendedPrismaClient;
    const whereClause: any = {
      isActive: true,
    };
    const total = await client.user.count({ where: whereClause });
    return total;
  }
}
