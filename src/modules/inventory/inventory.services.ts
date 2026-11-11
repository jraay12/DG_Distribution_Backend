import { requiredText } from "../../utils/input";
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
import { emitAddStock, emitProductInventory } from "../../utils/socket/socket.publisher";

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

    const updatedInventory = await this.prisma.$transaction(async (tx) => {
      const updated = await this.inventoryRepo.update(inventory, tx as typeof this.prisma)
      await this.stockMovementRepo.save(stockMovement, tx as typeof this.prisma)

      return updated
    })

    emitProductInventory({product_id: updatedInventory.product_id, quantity: updatedInventory.quantity})
    
    return inventory.toJson()
  }

  async deductStock(data: {product_id: string, quantity: number}, user_id: string): Promise<InventoryResponseDTO>{
    const product = await this.productRepo.findById(data.product_id)
    if(!product) throw new NotFoundError("Product not found")
    if(product.isDeleted) throw new BadRequestError("Cannot deduct stock to the product that is deleted")

    const inventory = await this.inventoryRepo.findById(data.product_id)
    if (!inventory) throw new NotFoundError("Inventory for this product not found")

    inventory.deductStock({quantity: data.quantity})
    const stockMovement = StockMovement.create({type: Type.ADJUSTMENT , product_id: data.product_id, quantity: data.quantity, created_by: user_id})


    const updatedInventory = await this.prisma.$transaction(async (tx) => {
      const updated = await this.inventoryRepo.update(inventory, tx as typeof this.prisma)
      await this.stockMovementRepo.save(stockMovement, tx as typeof this.prisma)

      return updated
    })

    emitProductInventory({product_id: updatedInventory.product_id, quantity: updatedInventory.quantity})
    
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
  async updateIdentifiers(product_id: string, input: { case_code?: unknown; barcode?: unknown }) {
    const data: { case_code?: string | null; barcode?: string | null } = {};
    for (const field of ["case_code", "barcode"] as const) {
      const value = input?.[field];
      if (value !== undefined) data[field] = value === null ? null : requiredText(value, field);
    }
    if (!Object.keys(data).length) throw new BadRequestError("Provide case_code or barcode");
    try {
      return await this.inventoryRepo.updateIdentifiers(product_id, data);
    } catch (error) {
      if (typeof error === "object" && error && "code" in error && error.code === "P2025") {
        throw new NotFoundError("Active product inventory not found");
      }
      throw error;
    }
  }

  async lookup(input: { case_code?: unknown; barcode?: unknown }) {
    if ((input.case_code === undefined) === (input.barcode === undefined)) {
      throw new BadRequestError("Provide exactly one of case_code or barcode");
    }
    const inventory = await this.inventoryRepo.lookup(input.case_code === undefined
      ? { barcode: requiredText(input.barcode, "barcode") }
      : { case_code: requiredText(input.case_code, "case_code") });
    if (!inventory) throw new NotFoundError("Active product inventory not found");
    return inventory;
  }
}
