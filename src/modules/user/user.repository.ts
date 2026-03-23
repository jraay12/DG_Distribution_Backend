import { PrismaClient } from "@prisma/client";
import { User } from "./user.entity";

export class UserRepository {
  constructor(private prisma: PrismaClient) {}

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
}
