import { NextFunction, Request, Response } from "express";
import { ActivityService } from "./activity.service";

export class ActivityController {
  constructor(private activityService: ActivityService) {}
  recordLocation = async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json({ message: "Location recorded", data: await this.activityService.recordLocation(req.user.user_id, req.body) }); }
    catch (error) { next(error); }
  };
  getLocations = async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(200).json({ data: await this.activityService.getLocations(req.query as any) }); }
    catch (error) { next(error); }
  };
  getActivities = async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(200).json({ data: await this.activityService.getAgentActivities(req.query as any) }); }
    catch (error) { next(error); }
  };
}
