import { requiredText } from "../../utils/input";
import { CreateCustomerDTO } from "./dto/CreateCustomerDTO";
import { UpdateCustomerDTO } from "./dto/UpdateCustomerDTO";
import crypto from "crypto";
import { BadRequestError } from "../../utils/error/BadRequestError";

export interface CustomerProps {
  id: string;
  store_name: string;
  owner_name: string;
  contact_number: string;
  createdAt?: Date;
  address: string;
  street?: string | null;
  barangay?: string | null;
  city_municipality?: string | null;
  province?: string | null;
  territory?: string | null;
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

  static create(input: CreateCustomerDTO) {
    return new Customer({ id: crypto.randomUUID(), ...this.details(input) });
  }

  updateCustomer(input: UpdateCustomerDTO) {
    this.props = { ...this.props, ...Customer.details(input, this.props), updatedAt: new Date() };
  }

  private static details(input: UpdateCustomerDTO, existing?: CustomerProps) {
    const detail = (key: "store_name" | "owner_name" | "contact_number") =>
      requiredText(input?.[key] === undefined ? existing?.[key] : input[key], key);

    let { address, street, barangay, city_municipality, province, territory } = existing ?? {};
    if (input?.street !== undefined || input?.barangay !== undefined ||
        input?.city_municipality !== undefined || input?.province !== undefined) {
      street = requiredText(input.street === undefined ? street : input.street, "street");
      barangay = requiredText(input.barangay === undefined ? barangay : input.barangay, "barangay");
      city_municipality = requiredText(
        input.city_municipality === undefined ? city_municipality : input.city_municipality,
        "city_municipality",
      );
      province = requiredText(input.province === undefined ? province : input.province, "province");
      address = [street, barangay, city_municipality, province].join(", ");
    } else if (input?.address !== undefined && input.address !== address) {
      address = requiredText(input.address, "address", 800);
      street = barangay = city_municipality = province = null;
    }
    if (!address) throw new BadRequestError("Provide the four address fields or an address");
    if (input?.territory !== undefined) {
      territory = input.territory === null ? null : requiredText(input.territory, "territory");
    }

    return {
      store_name: detail("store_name"),
      owner_name: detail("owner_name"),
      contact_number: detail("contact_number"),
      address, street: street ?? null, barangay: barangay ?? null,
      city_municipality: city_municipality ?? null, province: province ?? null,
      territory: territory ?? null,
    };
  }

  static hydrate(props: CustomerProps):Customer {
    return new Customer(props)
  }

  delete() {
    if (this.props.deletedAt) throw new BadRequestError("Customer already deleted")

    this.props.deletedAt = new Date()
    this.props.updatedAt = new Date()
  }

  restore() {
    if (!this.props.deletedAt) throw new BadRequestError("Cannot restore customer not deleted")

    this.props.deletedAt = null
    this.props.updatedAt = new Date()
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
