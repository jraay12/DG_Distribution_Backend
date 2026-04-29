import { PromoCodeService } from "./promo.service";
import { CreatePromoCodeDto } from "./dto/CreatePromoCodeDTO";
import { PromoCodeResponseDto } from "./dto/PromoCodeResponseDTO";
import { Request, Response, NextFunction } from "express";

export class PromoCodeController {
  constructor(private promoCodeService: PromoCodeService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input: CreatePromoCodeDto = req.body as CreatePromoCodeDto;
      const result = await this.promoCodeService.create(input);
      res.status(200).json({
        message: "Successfully create promo code",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  disabled = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const inputParams = req.params as { id: string };
      await this.promoCodeService.disable(inputParams.id);
      res.status(200).json({
        message: "Successfully disabled promo code",
      });
    } catch (error) {
      next(error);
    }
  };

  enabled = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const inputParams = req.params as { id: string };
      await this.promoCodeService.enabled(inputParams.id);
      res.status(200).json({
        message: "Successfully activate promo code",
      });
    } catch (error) {
      next(error);
    }
  };

  getPromos = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.promoCodeService.getPromos();
      res.status(200).json({
        message: "Successfully retrieve promo",
        data: result
      });
    } catch (error) {
      next(error);
    }
  };
}
