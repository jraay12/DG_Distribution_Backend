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
}
