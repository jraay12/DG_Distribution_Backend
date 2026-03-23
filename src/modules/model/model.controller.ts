import { CreateModelDTO } from "./dto/CreateModelDTO";
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
}
