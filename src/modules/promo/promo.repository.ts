import { ExtendedPrismaClient } from "../../config/prisma";
import { PromoCode } from "./promo.entity";

export class PromoCodeRepository {
  constructor(private prisma: ExtendedPrismaClient) {}

  async create(promoCode: PromoCode): Promise<void> {
    await this.prisma.promoCode.create({
      data: {
        id: promoCode.id,
        code: promoCode.code,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
        maxUsage: promoCode.maxUsage,
        expiresAt: promoCode.expiresAt,
        createdAt: promoCode.createdAt,
        updatedAt: promoCode.updatedAt,
      },
    });
  }

  async findByPromoCode(promo_code: string): Promise<PromoCode | null> {
    const promoCode = await this.prisma.promoCode.findUnique({
      where: {
        code: promo_code,
      },
    });

    if (!promoCode) return null;

    return PromoCode.hydrate(promoCode);
  }

  async update(promoCode: PromoCode, id: string): Promise<void> {
    await this.prisma.promoCode.update({
      where: {
        id,
      },
      data: promoCode.toJson(),
    });
  }

  async findById(id: string): Promise<PromoCode | null> {
    const promoCode = await this.prisma.promoCode.findUnique({
      where: {
        id
      },
    });

    if (!promoCode) return null;

    return PromoCode.hydrate(promoCode);
  }
}
