import { NextFunction, Request, Response } from "express";
import { QuotaService } from "./quota.service";

export class QuotaController {
  constructor(private quotaService: QuotaService) {}
  setQuota = async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(200).json({ message: "Quota saved successfully", data: await this.quotaService.setQuota(req.body) }); }
    catch (error) { next(error); }
  };
  mine = async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(200).json({ data: await this.quotaService.getProgress(req.user.user_id, req.query.from as string, req.query.to as string) }); }
    catch (error) { next(error); }
  };
  byUser = async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(200).json({ data: await this.quotaService.getProgress(req.params.user_id as string, req.query.from as string, req.query.to as string) }); }
    catch (error) { next(error); }
  };
  all = async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(200).json({ data: await this.quotaService.getAll(req.query.from as string, req.query.to as string) }); }
    catch (error) { next(error); }
  };
}
