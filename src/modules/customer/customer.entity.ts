import crypto from "crypto";
import { BadRequestError } from "../../utils/error/BadRequestError";

export interface CustomerProps {
  id: string;
  store_name: string;
  owner_name: string;
  contact_number: string;
  createdAt?: Date;
  address: string
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export class Customer {
  private props: CustomerProps;
  constructor(props: CustomerProps) {
    this.props = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
      deletedAt: props.deletedAt ?? null,
    };
  }

  static create(
    props: Omit<CustomerProps, "id" | "createdAt" | "updatedAt" | "deletedAt">,
  ) {
    if (!props.store_name) throw new BadRequestError("Store name is required");
    if (!props.owner_name) throw new BadRequestError("Owner name is required");
    if (!props.contact_number)
      throw new BadRequestError("Contact number is required");
    if (!props.address)
      throw new BadRequestError("Address is required");

    return new Customer({ ...props, id: crypto.randomUUID() });
  }

  updateCustomer(props: Omit<CustomerProps, "id" | "createdAt" | "updatedAt" | "deletedAt">){
    if (!props.store_name) throw new BadRequestError("Store name is required");
    if (!props.owner_name) throw new BadRequestError("Owner name is required");
    if (!props.contact_number)
      throw new BadRequestError("Contact number is required");
    if (!props.address)
      throw new BadRequestError("Address is required");

    this.props.store_name = props.store_name
    this.props.owner_name = props.owner_name
    this.props.address = props.address
    this.props.contact_number = props.contact_number
    this.props.updatedAt = new Date()
  }
  
  static hydrate(props: CustomerProps):Customer {
    return new Customer(props)
  }

  get id(): string {
    return this.props.id;
  }

  get storeName(): string {
    return this.props.store_name;
  }

  get ownerName(): string {
    return this.props.owner_name;
  }

  get contactNumber(): string {
    return this.props.contact_number;
  }

  get createdAt(): Date {
    return this.props.createdAt!;
  }

  get updatedAt(): Date {
    return this.props.updatedAt!;
  }

  get deletedAt(): Date | null | undefined {
    return this.props.deletedAt;
  }

  get address(): string {
    return this.props.address
  }

  toJSON(): CustomerProps {
    return { ...this.props };
  }
}
