import { ExtendedPrismaClient } from "../../config/prisma";
import { ProductWithModelResponseDTO } from "./dto/ProductWithModelResponse";
import { Product } from "./product.entity";
import { ProductCategory } from "./product.enum";

export class ProductRepository {
  constructor(private prisma: ExtendedPrismaClient) {}

  async save(product: Product, tx?: typeof this.prisma): Promise<void> {
    const client = (tx ?? this.prisma) as ExtendedPrismaClient;
    await client.product.create({
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

  async findById(product_id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: {
        id: product_id,
      },
    });

    if (!product) return null;

    const productProps = {
      ...product,
      price: product.price.toNumber(),
      category: product.category as ProductCategory,
    };

    return Product.hydrate(productProps);
  }

  async restore(product_id: string): Promise<void> {
    await this.prisma.product.update({
      where: { id: product_id },
      data: {
        deletedAt: null,
      },
    });
  }

  async getProduct(
    page: number,
    limit: number,
    category?: string,
  ): Promise<ProductWithModelResponseDTO[]> {
    const skip = (page - 1) * limit;

    const whereClause: any = { deletedAt: null };
    if (category) {
      whereClause.category = category;
    }

    const product = await this.prisma.product.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      where: whereClause,
      include: {
        model: {
          select: {
            model_name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    return product.map((e) => ({
      id: e.id,
      product_name: e.product_name,
      model_name: e.model.model_name,
      model_id: e.model_id,
      category: e.category as ProductCategory,
      price: e.price.toNumber(),
      created_by: e.user.name,
    }));
  }

  async productCount(
    category?: string,
    tx?: typeof this.prisma,
  ): Promise<number> {
    const client = (tx ?? this.prisma) as ExtendedPrismaClient;
    const whereClause: any = {
      deletedAt: null,
    };

    if (category) {
      whereClause.category = category;
    }
    const total = await client.product.count({ where: whereClause });
    return total;
  }

  async update(product: Product, tx?: typeof this.prisma): Promise<void> {
    const client = tx ?? (this.prisma as ExtendedPrismaClient);

    await client.product.update({
      where: {
        id: product.id,
      },
      data: {
        category: product.category,
        price: product.price,
        product_name: product.productName,
        model_id: product.modelId,
      }
    });
  }
}
