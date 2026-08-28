import { NextFunction, Request, Response } from "express";
import { DailyReportService } from "./daily-report.service";

export class DailyReportController {
  constructor(private reportService: DailyReportService) {}

  submit = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.reportService.submit(req.user.user_id, req.body);
      res.status(201).json({ message: "Daily report submitted successfully", data });
    } catch (error) { next(error); }
  };

  getMine = async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(200).json({ data: await this.reportService.getMine(req.user.user_id) }); }
    catch (error) { next(error); }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(200).json({ data: await this.reportService.getAll(req.query as any) }); }
    catch (error) { next(error); }
  };

  review = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.reportService.review(req.params.id as string, req.user.user_id, req.body);
      res.status(200).json({ message: "Daily report reviewed successfully", data });
    } catch (error) { next(error); }
  };
}
