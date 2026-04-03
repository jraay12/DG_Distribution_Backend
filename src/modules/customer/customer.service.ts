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
}