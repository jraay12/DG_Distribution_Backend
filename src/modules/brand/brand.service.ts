import { BrandRepository } from "./brand.repository";
import { BrandResponseDTO } from "./dto/BrandResponseDTO";
import { Brand } from "./brand.entity";
import { UserRepository } from "../user/user.repository";
import { NotFoundError } from "../../utils/error/NotFoundError";
import { ForbiddenError } from "../../utils/error/ForbiddenError";
export class BrandService {
  constructor(
    private brandRepo: BrandRepository,
    private userRepo: UserRepository,
  ) {}

  async create(
    data: { brand_name: string },
    user_id: string,
  ): Promise<BrandResponseDTO> {
    const user = await this.userRepo.findById(user_id);
    if (!user) throw new NotFoundError("User not found");

    if(!user.isAdmin) throw new ForbiddenError("Only admins can create brand")
      
    const brand = Brand.create(data);

    await this.brandRepo.create(brand);

    return brand.toSafeObject();
  }
}
