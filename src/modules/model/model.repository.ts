import { ExtendedPrismaClient } from "../../config/prisma";
import { ModelWithBrandResponseDTO } from "./dto/ModelResponseDTO";
import { Model } from "./model.entity";

export class ModelRepository {
  constructor(private prisma: ExtendedPrismaClient) {}

  async create(model: Model): Promise<void> {
    await this.prisma.model.create({
      data: {
        model_name: model.modelName,
        id: model.id,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
        deletedAt: model.deletedAt,
        brand_id: model.brandId,
      },
    });
  }

  async update(model: Model): Promise<void> {
    await this.prisma.model.update({
      where: {
        id: model.id,
      },
      data: {
        brand_id: model.brandId,
        model_name: model.modelName,
      },
    });
  }

  async findById(model_id: string): Promise<Model | null> {
    const model = await this.prisma.model.findUnique({
      where: { id: model_id },
    });

    if (!model) return null;

    return Model.hydrate(model);
  }

  async getModels(includeDeleted: boolean): Promise<ModelWithBrandResponseDTO[]> {
    const models = await this.prisma.model.findMany({
      where: {
        deletedAt: includeDeleted ? undefined : null,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        brand: {
          select: {
            brand_name: true,
          },
        },
      },
    });

    return models.map((e) => ({
      id: e.id,
      brand_name: e.brand.brand_name,
      model_name: e.model_name,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      deletedAt: e.deletedAt,
    }));
  }

  async softDelete(model_id: string): Promise<void> {
    await this.prisma.model.delete({
      where: { id: model_id },
    });
  }

  async restore(model_id: string): Promise<void> {
    await this.prisma.model.update({
      where: { id: model_id },
      data: { deletedAt: null },
    });
  }

  async findByIdWithBrand(
    model_id: string,
  ): Promise<ModelWithBrandResponseDTO | null> {
    const model = await this.prisma.model.findUnique({
      where: { id: model_id },
      include: {
        brand: {
          select: { brand_name: true },
        },
      },
    });

    if (!model) return null;

    return {
      id: model.id,
      brand_name: model.brand.brand_name,
      model_name: model.model_name,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
    };
  }
}
