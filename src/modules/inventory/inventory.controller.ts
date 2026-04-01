import { InventoryService } from "./inventory.services";
import { Request, Response, NextFunction } from "express";
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  addStock = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { product_id } = req.params as { product_id: string };
      const user_id = req.user.user_id
      const { quantity } = req.body as {
        quantity: number;
      };
      const result = await this.inventoryService.addStock({
        product_id,
        quantity,
      }, user_id);
      res.status(200).json({ result });
    } catch (error) {
      next(error);
    }
  };

  deductStock = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { product_id } = req.params as { product_id: string };
      const { quantity } = req.body as {
        quantity: number;
      };
      const result = await this.inventoryService.deductStock({
        product_id,
        quantity,
      });
      res.status(200).json({ result });
    } catch (error) {
      next(error);
    }
  };

  updateReorderLevel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { product_id } = req.params as { product_id: string };
      const { reorder_level } = req.body as {
        reorder_level: number;
      };
      const result = await this.inventoryService.updateReorderLevel({
        product_id,
        reorder_level,
      });
      res.status(200).json({ result });
    } catch (error) {
      next(error);
    }
  };
}
