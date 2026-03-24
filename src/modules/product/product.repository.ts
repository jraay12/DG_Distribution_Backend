import { ExtendedPrismaClient } from "../../config/prisma";
import { Product } from "./product.entity";

export class ProductRepository{
  constructor(private prisma: ExtendedPrismaClient){}

  async save(product: Product): Promise<void> {
    await this.prisma.product.create({
      data: {
        id: product.id,
        model_id: product.modelId,
        product_name: product.productName,
        price: product.price,
        category: product.category,
        created_by: product.createdBy,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        deletedAt: product.deletedAt,
      }
    })
  }
}