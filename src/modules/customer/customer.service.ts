import { Customer } from "./customer.entity";
import { CustomerRepository } from "./customer.repository";
import { CreateCustomerDTO } from "./dto/CreateCustomerDTO";
import { CustomerResponseDTO } from "./dto/CustomerResponseDTO";

export class CustomerService {
  constructor(private customerRepo: CustomerRepository){}

  async create(data: CreateCustomerDTO): Promise<CustomerResponseDTO>{
    const customer = Customer.create(data)

    await this.customerRepo.save(customer)

    return customer.toJSON()
  }
}