import { Request, Response } from "express";
import { OrderService } from "./order.service";

export class OrderController {
  constructor(private orderService: OrderService) {}

  submit = async (req: Request, res: Response) => {
    const data = await this.orderService.submit(req.params.store_visit_id as string, req.body, req.user);
    res.json({ data });
  };

  getByVisit = async (req: Request, res: Response) => {
    const data = await this.orderService.getByVisit(req.params.store_visit_id as string, req.user);
    res.json({ data });
  };

  list = async (req: Request, res: Response) => {
    res.json(await this.orderService.list(req.query));
  };
}
