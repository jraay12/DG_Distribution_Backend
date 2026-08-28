import { Request, Response, NextFunction } from "express";
import { TransactionService } from "./transaction.service";

export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user_id = req.user.user_id;

      const input = {
        store_visit_id: req.body.store_visit_id,
        type: req.body.type,
        items: req.body.items,
        promo_code: req.body.promo_code,
        user_id,
      };

      const result = await this.transactionService.create(input);

      res.status(200).json({
        message: "Transaction created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };

      const result = await this.transactionService.getById(id, req.user);

      res.status(200).json({
        message: "Transaction retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getByStoreVisit = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { store_visit_id } = req.params as {
        store_visit_id: string;
      };

      const result =
        await this.transactionService.getByStoreVisit(store_visit_id, req.user);

      res.status(200).json({
        message: "Transactions retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
