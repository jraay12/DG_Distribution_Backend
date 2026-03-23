import { ExtendedPrismaClient } from "../../config/prisma";
import { Model } from "./model.entity";

export class ModelRepository{
  constructor(private prisma: ExtendedPrismaClient){}

  async create(model: Model): Promise<void> {
    await this.prisma.model.create({
      data: {
        model_name: model.modelName,
        id: model.id,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
        deletedAt: model.deletedAt,
        brand_id: model.brandId
      }
    })
  }
}