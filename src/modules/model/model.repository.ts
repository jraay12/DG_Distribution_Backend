import { ExtendedPrismaClient } from "../../config/prisma";
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

  async getActiveModels(): Promise<Model[]> {
    const models = await this.prisma.model.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return models.map(Model.hydrate);
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
}
