import { BadRequestError } from "../../utils/error/BadRequestError";
import { CreatePromoCodeDto } from "./dto/CreatePromoCodeDTO";
import { PromoCodeResponseDto } from "./dto/PromoCodeResponseDTO";
import { PromoCodeRepository } from "./promo.repository";
import { PromoCode } from "./promo.entity";
import { ConflictError } from "../../utils/error/ConflictError";
export class PromoCodeService {
  constructor(private promoCodeRepo: PromoCodeRepository){}

  async create(dto: CreatePromoCodeDto): Promise<PromoCodeResponseDto> {
    const existing_code = await this.promoCodeRepo.findByPromoCode(dto.code)

    if(existing_code) throw new ConflictError("This code already exist, try new one")

    const promo = PromoCode.create(dto)

   await this.promoCodeRepo.create(promo)

   return promo.toJson()
  }
}