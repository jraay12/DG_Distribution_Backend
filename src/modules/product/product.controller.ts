import { NextFunction, Request, Response } from "express";
import { ProductService } from "./product.service";
import { CreateProductDTO } from "./dto/CreateProductDTO";

export class ProductController {
  constructor(private productService: ProductService) {}

  save = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input: CreateProductDTO = req.body as CreateProductDTO;
      const user_id = req.user?.user_id;
      const result = await this.productService.save({
        ...input,
        created_by: user_id,
      });
      res.status(201).json({
        message: "Successfully added new product",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  softDelete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const inputParams = req.params as { product_id: string };
      const result = await this.productService.softDelete(
        inputParams.product_id,
      );
      res.status(200).json({
        message: `Successfully delete ${result.product_name}`,
      });
    } catch (error) {
      next(error);
    }
  };

  restore = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const inputParams = req.params as { product_id: string };
      const result = await this.productService.restore(inputParams.product_id);
      res.status(200).json({
        message: `Successfully restore ${result.product_name}`,
      });
    } catch (error) {
      next(error);
    }
  };

  getProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await this.productService.getProduct(page, limit);
      res.status(200).json({
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  };
}
