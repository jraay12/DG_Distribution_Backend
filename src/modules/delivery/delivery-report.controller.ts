import { DeliveryService } from "./delivery-report.service";
import { Request, Response, NextFunction } from "express";
import { CreateDeliveryReportDTO } from "./dto/CreateDeliveryReportDTO";
import fs from "fs";

export class DeliveryController {
  constructor(private deliveryService: DeliveryService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    let filePath: string;
    try {
      const inputBody: CreateDeliveryReportDTO =
        req.body as CreateDeliveryReportDTO;

      if (!req.file)
        res.status(400).json({
          error: "No file uploaded",
        });
      filePath = (req.file as any).path;

      await this.deliveryService.save({ ...inputBody, image_path: filePath });
      res.status(201).json({
        message: "Successfully create delivery report",
      });
    } catch (error) {
      if (filePath! && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      next(error);
    }
  };

  createNewEvidence = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    let filePath: string;

    try {
      const { delivery_id } = req.params as { delivery_id: string };
      if (!req.file)
        res.status(400).json({
          error: "No file uploaded",
        });
      filePath = (req.file as any).path;
      await this.deliveryService.saveNewEvidence({
        id: delivery_id,
        image_path: filePath,
      });
      res.status(201).json({ message: "Successfully added new evidence " });
    } catch (error) {
      if (filePath! && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      next(error);
    }
  };

  getEvidences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { delivery_id } = req.params as { delivery_id: string };
      const result = await this.deliveryService.getAllEvidences(delivery_id)
      res.status(200).json({
        message: result
      })
    } catch (error) {
      next(error);
    }
  };
}
