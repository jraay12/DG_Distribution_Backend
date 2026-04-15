import { NotFoundError } from "../../utils/error/NotFoundError";
import { Customer } from "./customer.entity";
import { CustomerRepository } from "./customer.repository";
import { CreateCustomerDTO } from "./dto/CreateCustomerDTO";
import { CustomerResponseDTO } from "./dto/CustomerResponseDTO";
import { UpdateCustomerDTO } from "./dto/UpdateCustomerDTO";

export class CustomerService {
  constructor(private customerRepo: CustomerRepository){}

  async create(data: CreateCustomerDTO): Promise<CustomerResponseDTO>{
    const customer = Customer.create(data)

    await this.customerRepo.save(customer)

    return customer.toJSON()
  }

  async update(data: UpdateCustomerDTO, customer_id: string): Promise<CustomerResponseDTO> {
    const customer = await this.customerRepo.findById(customer_id)

    if (!customer) throw new NotFoundError("Customer not found")

    customer.updateCustomer(data)

    await this.customerRepo.update(customer)

    return customer.toJSON()
  }

  async findById(customer_id: string): Promise<CustomerResponseDTO> {
    const customer = await this.customerRepo.findById(customer_id)

    if (!customer) throw new NotFoundError("Customer not found")

    return customer.toJSON()
  }

  async delete(customer_id: string): Promise<void> {
    const customer = await this.customerRepo.findById(customer_id)

    if(!customer) throw new NotFoundError("Customer not found")

    customer.delete()

    await this.customerRepo.delete(customer_id)
  }

  async restore(customer_id: string): Promise<void> {
    const customer = await this.customerRepo.findById(customer_id)

    if(!customer) throw new NotFoundError("Customer not found")

    customer.restore()

    await this.customerRepo.restore(customer_id)
  }

  async getCustomers(status: "all" | "active" | "deleted" = "active"): Promise<CustomerResponseDTO[]> {
    const customers = await this.customerRepo.getCustomers(status)
    return customers.map(customer => customer.toJSON())
  }
}