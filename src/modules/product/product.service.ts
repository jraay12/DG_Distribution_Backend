import { BadRequestError } from "../../utils/error/BadRequestError";
import { NotFoundError } from "../../utils/error/NotFoundError";
import { ModelRepository } from "../model/model.repository";
import { CreateProductDTO } from "./dto/CreateProductDTO";
import { ProductResponseDTO } from "./dto/ProductResponseDTO";
import { PaginatedProductResponseDTO } from "./dto/ProductWithModelResponse";
import { Product } from "./product.entity";
import { ProductRepository } from "./product.repository";
import { emitProductStats } from "../../utils/socket/socket.publisher";
import { ExtendedPrismaClient } from "../../config/prisma";
import { UpdateProductDTO } from "./dto/UpdateProductDTO";
export class ProductService {
  constructor(private productRepo: ProductRepository, private modelRepo: ModelRepository, private prisma: ExtendedPrismaClient){}

  async save(data: CreateProductDTO): Promise<ProductResponseDTO> {
    const model = await this.modelRepo.findById(data.model_id)
    if(!model) throw new NotFoundError("Model not found")
    if(model.isDeleted) throw new BadRequestError("This model is no longer available")

    const product = Product.create(data)

    let productCount: number;

    await this.prisma.$transaction( async (tx) => {
      await this.productRepo.save(product, tx as typeof this.prisma)
      productCount = await this.productRepo.productCount(undefined, tx as typeof this.prisma);
    })
    
    emitProductStats(productCount!)

    return product.toJson()
  }

  async softDelete(product_id: string): Promise<ProductResponseDTO> {
    const product = await this.productRepo.findById(product_id)

    if (!product ) throw new NotFoundError("Product not found")

    product.delete()

    await this.productRepo.softDelete(product_id)

    return product.toJson()
  }

  async restore(product_id: string): Promise<ProductResponseDTO> {
    const product = await this.productRepo.findById(product_id)

    if (!product ) throw new NotFoundError("Product not found")

    product.restore()

    await this.productRepo.restore(product_id)

    return product.toJson()

  }

  async getProduct(page: number = 1, limit: number = 10, category?: string): Promise<PaginatedProductResponseDTO> {

    const [data, total] = await Promise.all([this.productRepo.getProduct(page, limit, category), this.productRepo.productCount(category)])
    
    const totalPage = Math.ceil(total / limit)

    const hasNextPage = page < totalPage

    const hasPrevPage = page > 1
    
    return {
      data: data,
      meta: {
        limit,
        page, 
        total,
        totalPage,
        hasNextPage,
        hasPrevPage
      }
    }
  }

  async update(data: UpdateProductDTO, product_id: string): Promise<ProductResponseDTO> {
    const product = await this.productRepo.findById(product_id)
    if (!product) throw new NotFoundError("Product not found")

    const model = await this.modelRepo.findById(data.model_id)
    if(!model) throw new NotFoundError("Model not found")

    product.update(data.product_name, data.price, data.category, data.model_id)

    await this.productRepo.update(product)

    return product.toJson()

  }
}