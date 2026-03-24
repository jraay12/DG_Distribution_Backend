import { NextFunction, Request, Response } from "express";
import { ProductService } from "./product.service";
import { CreateProductDTO } from "./dto/CreateProductDTO";

export class ProductController {
  constructor(private productService: ProductService){}

  save = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input: CreateProductDTO = req.body as CreateProductDTO
      const result = await this.productService.save(input)
      res.status(201).json({
        message: "Successfully added new product",
        data: result
      })
    } catch (error) {
      next(error)
    }
  }

  softDelete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const inputParams = req.params as {product_id: string}
      const result = await this.productService.softDelete(inputParams.product_id)
      res.status(200).json({
        message: `Successfully delete ${result.product_name}`
      })
    } catch (error) {
      next(error)
    }
  }
}