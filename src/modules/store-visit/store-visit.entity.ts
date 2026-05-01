import crypto from "crypto";
import { BadRequestError } from "../../utils/error/BadRequestError";

export interface StoreVisitProps {
  id: string;
  user_id: string;
  customer_id: string;
  time_in?: Date | null;
  time_out?: Date | null;
  visit_date: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export class StoreVisit {
  private props: StoreVisitProps;

  private constructor(props: StoreVisitProps) {
    this.props = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
      deletedAt: props.deletedAt ?? null,
    };
  }

  static create(
    props: Omit<
      StoreVisitProps,
      "id" | "createdAt" | "updatedAt" | "deletedAt" | "time_in" | "time_out"
    >,
  ): StoreVisit {
    if (!props.user_id) {
      throw new BadRequestError("User ID is required");
    }

    if (!props.customer_id) {
      throw new BadRequestError("Customer ID is required");
    }

    if (!props.visit_date) throw new BadRequestError("Visit date is required");

    return new StoreVisit({
      ...props,
      id: crypto.randomUUID(),
    });
  }

  static hydrate(props: StoreVisitProps): StoreVisit {
    return new StoreVisit(props);
  }

  // getters

  get id(): string | undefined {
    return this.props.id;
  }

  get userId(): string {
    return this.props.user_id;
  }

  get customerId(): string {
    return this.props.customer_id;
  }

  get time_in(): Date {
    return this.props.time_in!;
  }

  get time_out(): Date {
    return this.props.time_out!;
  }

  get createdAt(): Date {
    return this.props.createdAt!;
  }

  get updatedAt(): Date {
    return this.props.updatedAt!;
  }

  get deletedAt(): Date | null {
    return this.props.deletedAt ?? null;
  }

  get visitDate(): Date {
    return this.props.visit_date;
  }

  // behaviors

  softDelete() {
    this.props.deletedAt = new Date();
    this.touch();
  }

  restore() {
    this.props.deletedAt = null;
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  delete() {
    if (this.props.time_in != null || this.props.time_out != null)
      throw new BadRequestError(
        "Cannot delete assigned routes that has marked time in or time out already",
      );
  }

  markTimeIn(){
    if(this.props.time_in !== null) throw new BadRequestError("Already marked the time in")
    this.props.time_in = new Date()
    this.touch()
  }

  markTimeOut(){
    if(this.props.time_out !== null) throw new BadRequestError("Already marked the time out")

    if(!this.props.time_in) throw new BadRequestError("Cannot mark time out without marking the time In")
    this.props.time_out = new Date()
    this.touch()
  }

  // serialization (for repository)

  toJSON(): StoreVisitProps {
    return { ...this.props };
  }
}
