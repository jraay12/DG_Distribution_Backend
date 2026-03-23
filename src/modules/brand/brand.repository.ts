import { Brand } from "./brand.entity";
import { ExtendedPrismaClient } from "../../config/prisma";
export class BrandRepository {
  constructor(private prisma: ExtendedPrismaClient) {}

  async create(brand: Brand): Promise<void> {
    await this.prisma.brand.create({
      data: {
        brand_name: brand.brand_name,
        createdAt: brand.createdAt,
        updatedAt: brand.updateAt,
        deletedAt: null,
      },
    });
  }

  async findById(brand_id: string): Promise<Brand | null> {
    const brand = await this.prisma.brand.findUnique({
      where: { id: brand_id },
    });

    if (!brand) return null;

    return Brand.hydrate(brand);
  }

  async delete(brand_id: string): Promise<void> {
    await this.prisma.brand.delete({ where: { id: brand_id } });
  }
}
