import crypto from "crypto";

export interface StoreVisitProps {
  id: string;
  user_id: string;
  customer_id: string;
  time_in?: Date | null
  time_out?: Date | null
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
      "id" | "createdAt" | "updatedAt" | "deletedAt" | "visted" | "time_in" | "time_out"
    >,
  ): StoreVisit {
    if (!props.user_id) {
      throw new Error("User ID is required");
    }

    if (!props.customer_id) {
      throw new Error("Customer ID is required");
    }

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

  // serialization (for repository)

  toJSON(): StoreVisitProps {
    return { ...this.props };
  }
}
