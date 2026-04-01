import { ExtendedPrismaClient } from "../../config/prisma";
import { BadRequestError } from "../../utils/error/BadRequestError";
import { NotFoundError } from "../../utils/error/NotFoundError";
import { ProductRepository } from "../product/product.repository";
import { StockMovement } from "../Stock Movement/stock-movement.entity";
import { Type } from "../Stock Movement/stock-movement.enum";
import { StockMovementRepository } from "../Stock Movement/stock-movement.repository";
import { AddStockInventoryDTO } from "./dto/AddStockInventoryDTO";
import { InventoryResponseDTO } from "./dto/InventoryResponseDTO";
import { InventoryRepository } from "./inventory.repository";

export class InventoryService {
  constructor(private inventoryRepo: InventoryRepository, private productRepo: ProductRepository, private stockMovementRepo: StockMovementRepository, private prisma: ExtendedPrismaClient){}

  async addStock(data: AddStockInventoryDTO, user_id: string): Promise<InventoryResponseDTO>{
    const product = await this.productRepo.findById(data.product_id)
    if (!product) throw new NotFoundError("Product not found")

    const inventory = await this.inventoryRepo.findById(data.product_id)
    if (!inventory) throw new NotFoundError("Inventory for this product not found")

    if (product.isDeleted) throw new BadRequestError("Cannot add stock to the product that is deleted")

    inventory.addStock({quantity: data.quantity})

    const stockMovement = StockMovement.create({type: Type.IN , product_id: data.product_id, quantity: data.quantity, created_by: user_id})

    await this.prisma.$transaction(async (tx) => {
      await this.inventoryRepo.update(inventory, tx as typeof this.prisma)
      await this.stockMovementRepo.save(stockMovement, tx as typeof this.prisma)
    })
    

    return inventory.toJson()
  }

  async deductStock(data: {product_id: string, quantity: number}): Promise<InventoryResponseDTO>{
    const product = await this.productRepo.findById(data.product_id)
    if(!product) throw new NotFoundError("Product not found")
    if(product.isDeleted) throw new BadRequestError("Cannot deduct stock to the product that is deleted")

    const inventory = await this.inventoryRepo.findById(data.product_id)
    if (!inventory) throw new NotFoundError("Inventory for this product not found")

    inventory.deductStock({quantity: data.quantity})

    await this.inventoryRepo.update(inventory)

    return inventory.toJson()
  }

  async updateReorderLevel(data: {product_id: string, reorder_level: number}): Promise<InventoryResponseDTO>{
    const product = await this.productRepo.findById(data.product_id)
    if(!product) throw new NotFoundError("Product not found")
    if(product.isDeleted) throw new BadRequestError("Cannot add reorder level to deleted product")

    const inventory = await this.inventoryRepo.findById(data.product_id)
    if (!inventory) throw new NotFoundError("Inventory for this product not found")

    inventory.addReorderLevel({reorder_level: data.reorder_level})

    await this.inventoryRepo.update(inventory)

    return inventory.toJson()
  }
}