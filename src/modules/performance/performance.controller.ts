import { Request, Response } from "express";
import { PerformanceService } from "./performance.service";

export class PerformanceController {
  constructor(private performanceService: PerformanceService) {}

  mine = async (req: Request, res: Response) => {
    res.json({ data: await this.performanceService.mine(req.user.user_id, req.query.date) });
  };

  setTarget = async (req: Request, res: Response) => {
    res.json({ data: await this.performanceService.setTarget(req.body) });
  };
}
