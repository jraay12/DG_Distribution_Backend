import { BadRequestError } from "../../utils/error/BadRequestError";
import { NotFoundError } from "../../utils/error/NotFoundError";
import { ProductRepository } from "../product/product.repository";
import { AddStockInventoryDTO } from "./dto/AddStockInventoryDTO";
import { InventoryResponseDTO } from "./dto/InventoryResponseDTO";
import { InventoryRepository } from "./inventory.repository";

export class InventoryService {
  constructor(private inventoryRepo: InventoryRepository, private productRepo: ProductRepository){}

  async addStock(data: AddStockInventoryDTO): Promise<InventoryResponseDTO>{
    const product = await this.productRepo.findById(data.product_id)
    if (!product) throw new NotFoundError("Product not found")

    const inventory = await this.inventoryRepo.findById(data.product_id)
    if (!inventory) throw new NotFoundError("Inventory for this product not found")

    if (product.isDeleted) throw new BadRequestError("Cannot add stock to the product that is deleted")

    inventory.addStock({quantity: data.quantity})

    await this.inventoryRepo.update(inventory)

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
}