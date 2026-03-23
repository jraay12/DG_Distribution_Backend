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

    if (!user.isAdmin()) throw new ForbiddenError("Only admins can create brand");

    const brand = Brand.create(data);

    await this.brandRepo.create(brand);

    return brand.toSafeObject();
  }

  async delete(
    data: { brand_id: string },
    user_id: string,
  ): Promise<BrandResponseDTO> {
    const user = await this.userRepo.findById(user_id);

    if (!user) throw new NotFoundError("User not found");

    if (!user.isAdmin()) throw new ForbiddenError("Only admins can delete brand");

    const brand = await this.brandRepo.findById(data.brand_id);

    if (!brand) throw new NotFoundError("Brand not found");

    brand.softDelete();
    await this.brandRepo.delete(data.brand_id);

    return brand.toSafeObject();
  }

  async restore(brand_id: string, user_id: string): Promise<BrandResponseDTO> {
    const user = await this.userRepo.findById(user_id);

    if (!user) throw new NotFoundError("Not found user");

    if (!user.isAdmin())
      throw new ForbiddenError("Only admin can restore the deleted brand");

    const brand = await this.brandRepo.findById(brand_id);

    if (!brand) throw new NotFoundError("Brand not found");

    brand.restore();

    await this.brandRepo.restore(brand_id);

    return brand;
  }

  async getAllBrand(
    page: number = 1,
    limit: number = 10,
  ): Promise<BrandResponseDTO[]> {
    const brand = await this.brandRepo.getActiveBrands();
    return brand.map((e) => e.toJson());
  }

  async update(
    brand_id: string,
    data: { brand_name: string }, user_id: string
  ): Promise<BrandResponseDTO> {

    const user = await this.userRepo.findById(user_id)
    
    if(!user) throw new NotFoundError("User not found")

    if(!user.isAdmin()) throw new ForbiddenError("Only admin can update the brand name")

    const brand = await this.brandRepo.findById(brand_id);

    if (!brand) throw new NotFoundError("Brand not found");

    brand.updateName(data.brand_name);

    this.brandRepo.update(brand_id, data);

    return brand.toJson()
  }

  async findById(brand_id: string): Promise<BrandResponseDTO>{
    const brand = await this.brandRepo.findById(brand_id)

    if (!brand) throw new NotFoundError("Brand not found")
    
    return brand.toJson()
  }
}
