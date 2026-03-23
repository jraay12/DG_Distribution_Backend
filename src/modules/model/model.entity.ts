import { BadRequestError } from "../../utils/error/BadRequestError";
import crypto from "crypto";

export interface ModelProps {
  id: string;
  brand_id: string;
  model_name: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export class Model {
  private props: ModelProps;
  private static readonly MAX_MODELNAME_LENGTH = 100;
  constructor(props: ModelProps) {
    this.props = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
      deletedAt: props.deletedAt ?? null,
    };
  }

  static create(
    props: Omit<ModelProps, "id" | "createdAt" | "updatedAt" | "deletedAt">,
  ) {
    if (!props.model_name || props.model_name.trim().length === 0)
      throw new Error("Model Name is required");

    if (props.model_name.trim().length > Model.MAX_MODELNAME_LENGTH)
      throw new Error(
        `Model Name must not exceed ${Model.MAX_MODELNAME_LENGTH} characters`,
      );

    return new Model({
      ...props,
      id: crypto.randomUUID(),
    });
  }

  updateName(model_name: string): void {
    if (!model_name || model_name.trim().length === 0)
      throw new Error("Model Name is required");

    if (this.props.deletedAt) throw new Error("Cannot update deleted model");

    if (model_name.trim().length > Model.MAX_MODELNAME_LENGTH)
      throw new Error(
        `Model Name must not exceed ${Model.MAX_MODELNAME_LENGTH} characters`,
      );

    this.props.model_name = model_name;
    this.props.updatedAt = new Date();
  }

  delete(): void {
    if (this.props.deletedAt)
      throw new BadRequestError("Model is already deleted");

    this.props.deletedAt = new Date();
    this.props.updatedAt = new Date();
  }

  restore(): void {
    if (!this.props.deletedAt)
      throw new BadRequestError("Model is not deleted");

    this.props.deletedAt = null;
    this.props.updatedAt = new Date();
  }

  toJson() {
    return {
      id: this.props.id,
      brand_id: this.props.brand_id,
      model_name: this.props.model_name,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      deletedAt: this.props.deletedAt,
    };
  }

  // --- Getters ---
  get id(): string {
    return this.props.id;
  }

  get brandId(): string {
    return this.props.brand_id;
  }

  get modelName(): string {
    return this.props.model_name;
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

  get isDeleted(): boolean {
    return !!this.props.deletedAt;
  }

  get isActive(): boolean {
    return !this.props.deletedAt;
  }
}
