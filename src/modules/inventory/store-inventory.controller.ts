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

  getProductRecommendation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {customer_id} = req.params as {customer_id: string}
      const result = await this.storeInventoryService.getRecommendations(customer_id, req.query.store_visit_id, req.user);
      res.status(200).json({ result });
    } catch (error) {
      next(error);
    }
  };

  submitVisitCount = async (req: Request, res: Response) => {
    const result = await this.storeInventoryService.submitVisitCount(
      req.params.customer_id as string, req.body, req.user,
    );
    res.json({ result });
  };

  getVisitCount = async (req: Request, res: Response) => {
    const result = await this.storeInventoryService.getVisitCount(
      req.params.customer_id as string, req.query.store_visit_id, req.user,
    );
    res.json({ result });
  };

  adjustStock = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.storeInventoryService.adjustStock({
        customer_id: req.params.customer_id as string,
        product_id: req.params.product_id as string,
        quantity: req.body.quantity,
        type: req.body.type,
        user_id: req.user.user_id,
        role: req.user.role,
        store_visit_id: req.body.store_visit_id,
      });
      res.status(200).json({ message: "Store stock updated successfully", data: result });
    } catch (error) { next(error); }
  };
}
