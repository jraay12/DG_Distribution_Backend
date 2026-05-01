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

  previousRoutesAssigned = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {user_id} = req.params as {user_id: string};
      const result = await this.storeVisitService.getPreviousAssignRoute(user_id);
      res.status(200).json({
        message: "Successfully retrieve previous routes assigned",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  assignPreviousRoutes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {user_id} = req.params as {user_id: string};
      const {visit_date} = req.body as {visit_date: Date}
      const result = await this.storeVisitService.usePreviousAssignedRoutes(user_id, visit_date);
      res.status(200).json({
        message: `Successfully assigned the previous routes on ${result[0]?.visit_date}`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getAssignedRoutes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {user_id} = req.params as {user_id: string};
      const { visit_date } = req.query as { visit_date?: string };
      const result = await this.storeVisitService.getAssignedRoutes(user_id, visit_date ? new Date(visit_date): undefined);
      res.status(200).json({
      message: visit_date
        ? `Successfully retrieved assigned routes for ${visit_date}`
        : `Successfully retrieved assigned routes by user`,
      data: result,
    });
    } catch (error) {
      next(error);
    }
  };
}
