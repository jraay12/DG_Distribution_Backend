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
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const inputBody : UpdateModelDTO = req.body as UpdateModelDTO
      const inputParams = req.params as {model_id: string}
      const user_id = req.user?.user_id;

      const result = await this.modelService.update(inputBody, user_id, inputParams.model_id)
      res.status(200).json({
        message: "Successfully updated",
        data: result
      })
    } catch (error) {
      next(error)
    }
  }
}
