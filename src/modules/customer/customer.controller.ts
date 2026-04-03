import { CustomerService } from "./customer.service";
import { Request, Response, NextFunction } from "express";
import { CreateCustomerDTO } from "./dto/CreateCustomerDTO";
export class CustomerController {
  constructor(private customerService: CustomerService){}

  create = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const inputBody: CreateCustomerDTO = req.body as CreateCustomerDTO
      const result = await this.customerService.create(inputBody)
      res.status(201).json({
        message: "Successfully create customer",
        data: result
      })
    } catch (error) {
      next(error)
    }
  }

}