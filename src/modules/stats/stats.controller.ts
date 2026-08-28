import { StatsService } from "./stats.service";
import { NextFunction, Request, Response } from "express";
export class StatsController {
  constructor(private statsService: StatsService) {}

  getDashboardStats = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const stats = await this.statsService.getDashboardStats();
      res.status(200).json({ data: stats });
    } catch (error) {
      next(error);
    }
  };
}
