import { ExtendedPrismaClient } from "../../config/prisma";

export class CategoryRepository {
  constructor(private prisma: ExtendedPrismaClient) {}

  list() {
    return this.prisma.productCategory.findMany({ orderBy: { name: "asc" } });
  }

  findById(id: string) {
    return this.prisma.productCategory.findUnique({ where: { id } });
  }

  create(name: string) {
    return this.prisma.productCategory.create({ data: { name } });
  }

  update(id: string, name: string) {
    return this.prisma.productCategory.update({ where: { id }, data: { name } });
  }
}
