import { CreateModelDTO } from "./dto/CreateModelDTO";
import { UpdateModelDTO } from "./dto/UpdateModelDTO";
import { ModelService } from "./model.service";
import { Request, Response, NextFunction } from "express";
export class ModelController {
  constructor(private modelService: ModelService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input: CreateModelDTO = req.body as CreateModelDTO;
      const user_id = req.user?.user_id;
      const result = await this.modelService.create(input, user_id);
      res.status(200).json({
        message: "Successfully create new model",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const inputBody: UpdateModelDTO = req.body as UpdateModelDTO;
      const inputParams = req.params as { model_id: string };
      const user_id = req.user?.user_id;

      const result = await this.modelService.update(
        inputBody,
        user_id,
        inputParams.model_id,
      );
      res.status(200).json({
        message: "Successfully updated",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getModels = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const includeDeleted = req.query.includeDeleted === 'true';
      const result = await this.modelService.getModels(includeDeleted);
      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  softDelete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const inputParams = req.params as { model_id: string };
      const result = await this.modelService.softDelete(inputParams.model_id);
      res.status(200).json({
        message: `Successfully delete ${result.model_name} model`,
      });
    } catch (error) {
      next(error);
    }
  };

  restore = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const inputParams = req.params as { model_id: string };
      const result = await this.modelService.restore(inputParams.model_id);
      res.status(200).json({
        message: `Successfully restore ${result.model_name} model`,
      });
    } catch (error) {
      next(error);
    }
  };

  findByIdWithBrand = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const inputParams = req.params as { model_id: string };
      const result = await this.modelService.findByIdWithBrand(
        inputParams.model_id,
      );
      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
