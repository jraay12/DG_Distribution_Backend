import { BadRequestError } from "../../utils/error/BadRequestError";
import crypto from "crypto";

export interface DeliveryReportProps {
  id: string;
  user_id: string;
  customer_id: string;
  date: Date;
  remarks?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export class DeliveryReport {
  private props: DeliveryReportProps;

  constructor(props: DeliveryReportProps) {
    this.props = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
      deletedAt: props.deletedAt ?? null,
    };
  }

  static save(
    props: Omit<
      DeliveryReportProps,
      "id" | "createdAt" | "updatedAt" | "deletedAt"
    >,
  ) {
    if (!props.user_id) throw new BadRequestError("User ID is required");
    if (!props.customer_id)
      throw new BadRequestError("Customer ID is required");
    if (!props.date) throw new BadRequestError("Date is required");

    return new DeliveryReport({
      ...props,
      id: crypto.randomUUID(),
    });
  }

  static hydrate(props: DeliveryReportProps): DeliveryReport {
    return new DeliveryReport(props);
  }

  toJson(): DeliveryReportProps {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.user_id;
  }

  get customerId(): string {
    return this.props.customer_id;
  }

  get date(): Date {
    return this.props.date;
  }

  get remarks(): string {
    return this.props.remarks!;
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
}
