import { CustomerService } from "./customer.service";
import { Request, Response, NextFunction } from "express";
import { CreateCustomerDTO } from "./dto/CreateCustomerDTO";
import { UpdateCustomerDTO } from "./dto/UpdateCustomerDTO";
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

  update = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const inputParams = req.params as { customer_id: string}
      const inputBody: UpdateCustomerDTO = req.body as UpdateCustomerDTO
      const result = await this.customerService.update(inputBody, inputParams.customer_id)
      res.status(200).json({
        message: "Successfully update",
        data: result
      })
    } catch (error) {
      next(error)
    }
  }

  findById = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const {customer_id} = req.params as {customer_id: string}
      const result = await this.customerService.findById(customer_id)
      res.status(200).json({
        data: result
      })
    } catch (error) {
      next(error)
    }
  }

  delete = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const {customer_id} = req.params as {customer_id: string}
      await this.customerService.delete(customer_id)
      res.status(200).json({
        message: "Successfully delete customer"
      })
    } catch (error) {
      next(error)
    }
  }

  restore = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const {customer_id} = req.params as {customer_id: string}
      await this.customerService.restore(customer_id)
      res.status(200).json({
        message: "Successfully restore customer"
      })
    } catch (error) {
      next(error)
    }
  }

}