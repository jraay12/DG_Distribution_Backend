import { CreateStoreVisitDto } from "./dto/CreateDTO";
import { StoreVisitService } from "./store-visit.service";
import { Request, Response, NextFunction } from "express";

export class StoreVisitController {
  constructor(private storeVisitService: StoreVisitService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input: CreateStoreVisitDto = req.body as CreateStoreVisitDto;
      const result = await this.storeVisitService.save(input);
      res.status(200).json({
        message: "Successfully assign agent to store",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };


}
