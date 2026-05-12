import { StoreInventoryService } from "./store-inventory.service";
import { Request, Response, NextFunction } from "express";


export class StoreInventoryController {
  constructor(private storeInventoryService: StoreInventoryService){}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const inputBody = req.body as { product_id: string, customer_id: string, quantity: number };
      const result = await this.storeInventoryService.create(inputBody);
      res.status(200).json({ result });
    } catch (error) {
      next(error);
    }
  };

  getStoreInventories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {customer_id} = req.params as {customer_id: string}
      const result = await this.storeInventoryService.getStoreInventories(customer_id);
      res.status(200).json({ result });
    } catch (error) {
      next(error);
    }
  };
}

