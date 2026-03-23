import { BrandService } from "./brand.service";
import { Request, Response, NextFunction } from "express";

export class BrandController {
  constructor(private brandService: BrandService){}

  create = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const input = req.body as {brand_name: string}
      const user_id = req.user?.user_id
      const result = await this.brandService.create(input, user_id)
      res.status(201).json({
        message: `Successfully create ${result.brand_name} brand`,
        result
      })
    } catch (error) {
      next(error)
    }
  }
}