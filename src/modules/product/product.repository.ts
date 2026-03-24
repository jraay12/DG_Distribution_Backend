import { ExtendedPrismaClient } from "../../config/prisma";
import { Product } from "./product.entity";
import { ProductCategory } from "./product.enum";

export class ProductRepository {
  constructor(private prisma: ExtendedPrismaClient) {}

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
      },
    });
  }

  async softDelete(product_id: string): Promise<void> {
    await this.prisma.product.delete({
      where: {
        id: product_id,
      },
    });
  }

  async findById(product_id: string): Promise<Product | null > {
    const product = await this.prisma.product.findUnique({
      where: {
        id: product_id
      }
    })

    if(!product) return null

    const productProps = {
    ...product,
    price: product.price.toNumber(),
    category: product.category as ProductCategory
  };

    return Product.hydrate(productProps)

  }
}
