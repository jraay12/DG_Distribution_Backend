import { BadRequestError } from "../../utils/error/BadRequestError";
import { CreatePromoCodeDto } from "./dto/CreatePromoCodeDTO";
import { PromoCodeResponseDto } from "./dto/PromoCodeResponseDTO";
import { PromoCodeRepository } from "./promo.repository";
import { PromoCode } from "./promo.entity";
import { ConflictError } from "../../utils/error/ConflictError";
import { NotFoundError } from "../../utils/error/NotFoundError";
export class PromoCodeService {
  constructor(private promoCodeRepo: PromoCodeRepository){}

  async create(dto: CreatePromoCodeDto): Promise<PromoCodeResponseDto> {
    const existing_code = await this.promoCodeRepo.findByPromoCode(dto.code)

    if(existing_code) throw new ConflictError("This code already exist, try new one")

    const promo = PromoCode.create(dto)

   await this.promoCodeRepo.create(promo)

   return promo.toJson()
  }

  async disable(id: string): Promise<void> {
    const existing_promo = await this.promoCodeRepo.findById(id)

    if(!existing_promo) throw new NotFoundError("Promo code not found")

    existing_promo.disablePromoCode()

    await this.promoCodeRepo.update(existing_promo, id)
  }

  async enabled(id: string): Promise<void> {
    const existing_promo = await this.promoCodeRepo.findById(id)

    if(!existing_promo) throw new NotFoundError("Promo code not found")

    existing_promo.enablePromoCode()

    await this.promoCodeRepo.update(existing_promo, id)
  }

  async getPromos(): Promise<PromoCodeResponseDto[]> {
    const promos =  await this.promoCodeRepo.getPromos()

    return promos.map(promo => promo.toJson())
  }
}