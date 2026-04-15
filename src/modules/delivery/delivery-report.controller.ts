import { DeliveryService } from "./delivery-report.service";
import { Request, Response, NextFunction } from "express";
import { CreateDeliveryReportDTO } from "./dto/CreateDeliveryReportDTO";
import fs from "fs";

export class DeliveryController {
  constructor(private deliveryService: DeliveryService){}

   create = async(req: Request, res: Response, next: NextFunction) => {

    let filePath: string ;
    try {
      const inputBody: CreateDeliveryReportDTO = req.body as CreateDeliveryReportDTO

      if (!req.file) res.status(400).json({
        error: "No file uploaded"
      })
       filePath = (req.file as any).path
       
     await this.deliveryService.save({...inputBody, image_path: filePath})
      res.status(201).json({
        message: "Successfully create delivery report"
      })
    } catch (error) {

      if (filePath! && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      next(error)
    }
   }
}