import { BadRequestError } from "../../utils/error/BadRequestError";
import { ForbiddenError } from "../../utils/error/ForbiddenError";
import { NotFoundError } from "../../utils/error/NotFoundError";
import { BrandRepository } from "../brand/brand.repository";
import { UserRepository } from "../user/user.repository";
import { CreateModelDTO } from "./dto/CreateModelDTO";
import { ModelResponseDTO, ModelWithBrandResponseDTO } from "./dto/ModelResponseDTO";
import { UpdateModelDTO } from "./dto/UpdateModelDTO";
import { Model } from "./model.entity";
import { ModelRepository } from "./model.repository";

export class ModelService {
  constructor(
    private modelRepo: ModelRepository,
    private userRepo: UserRepository,
    private brandRepo: BrandRepository,
  ) {}

  async create(
    data: CreateModelDTO,
    user_id: string,
  ): Promise<ModelResponseDTO> {
    const user = await this.userRepo.findById(user_id);

    if (!user) throw new NotFoundError("User not found");

    if (!user.isAdmin())
      throw new ForbiddenError(
        "You do not have permission to perform this action",
      );

    const brand = await this.brandRepo.findById(data.brand_id);

    if (!brand) throw new NotFoundError("Brand not found");

    if(brand.isDeleted) throw new BadRequestError("Brand is deleted")

    const model = Model.create(data);
    await this.modelRepo.create(model);

    return model.toJson();
  }

  async update(data: UpdateModelDTO, user_id: string, model_id: string): Promise<ModelResponseDTO>{
    const user = await this.userRepo.findById(user_id)

    if(!user) throw new NotFoundError("User not found")

    if (!user.isAdmin()) throw new ForbiddenError("You do not have permission to perform this action")

    const brand = await this.brandRepo.findById(data.brand_id)

    if (!brand) throw new NotFoundError("Brand not found")

    if(brand.isDeleted) throw new BadRequestError("Brand is deleted")

    const model = await this.modelRepo.findById(model_id)

    if (!model) throw new NotFoundError("Model not found")

    model.update(data.model_name, data.brand_id)

    await this.modelRepo.update(model)

    return model.toJson()
  } 

  async getActiveModel() : Promise<ModelWithBrandResponseDTO[]> {
    const model = await this.modelRepo.getActiveModels()

    return model.map(e => ({
      id: e.id,
      brand_name: e.brand_name,
      model_name: e.model_name,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      deletedAt: e.deletedAt
    }))
  }

  async softDelete(model_id: string): Promise<ModelResponseDTO> {
    const model = await this.modelRepo.findById(model_id)

    if(!model) throw new NotFoundError("Model not found")

    model.delete()
    await this.modelRepo.softDelete(model_id)

    return model.toJson()
  }

  async restore(model_id: string): Promise<ModelResponseDTO> {
     const model = await this.modelRepo.findById(model_id)

    if(!model) throw new NotFoundError("Model not found")

    model.restore()
    await this.modelRepo.restore(model_id)

    return model.toJson()
  }

  async findByIdWithBrand(model_id: string): Promise<ModelWithBrandResponseDTO> {
    const model = await this.modelRepo.findByIdWithBrand(model_id)

    if (!model) throw new NotFoundError("Model not found")

    return model
  }

  async getAll(): Promise<ModelWithBrandResponseDTO[]> {
    const models = await this.modelRepo.getAll()
    return models
  }
}
