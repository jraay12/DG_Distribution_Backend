import { Request, Response } from "express";
import { CategoryService } from "./category.service";

export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  list = async (_req: Request, res: Response) => {
    res.json({ data: await this.categoryService.list() });
  };

  create = async (req: Request, res: Response) => {
    res.status(201).json({ data: await this.categoryService.create(req.body?.name) });
  };

  update = async (req: Request, res: Response) => {
    res.json({ data: await this.categoryService.update(req.params.id as string, req.body?.name) });
  };
}
