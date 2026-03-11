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
}
