import { BadRequestError } from "../../utils/error/BadRequestError"
import { Type } from "./stock-movement.enum"
import crypto from "crypto";

export interface StockMovementProps {
  id: string
  product_id: string
  type: Type
  quantity: number
  createdAt?: Date
  created_by: string
}

export class StockMovement {
  private props: StockMovementProps

  private constructor(props: StockMovementProps) {
    this.validate(props)

    const normalizedQuantity =
      props.type === Type.OUT
        ? -Math.abs(props.quantity)
        : props.type === Type.IN
        ? Math.abs(props.quantity)
        : props.quantity 

    this.props = {
      ...props,
      quantity: normalizedQuantity,
      createdAt: props.createdAt ?? new Date(),
    }
  }

  
  static create(props: Omit<StockMovementProps, "id">): StockMovement {
    return new StockMovement({
      ...props,
      id: crypto.randomUUID()
    })
  }

  
  private validate(props: StockMovementProps) {
    if (!props.id) {
      throw new BadRequestError("ID is required")
    }

    if (!props.product_id) {
      throw new BadRequestError("Product ID is required")
    }

    if (!props.created_by) {
      throw new BadRequestError("Created by is required")
    }

    if (props.quantity === null || props.quantity === undefined) {
      throw new BadRequestError("Quantity is required")
    }

    if (props.quantity === 0) {
      throw new BadRequestError("Quantity cannot be zero")
    }

    if (!props.type) {
      throw new BadRequestError("Type is required")
    }

    if (!Object.values(Type).includes(props.type)) {
      throw new BadRequestError(`Type must be one of: ${Object.values(Type).join(", ")}`)
    }
  }

  // Getters
  get id(): string {
    return this.props.id
  }

  get productId(): string {
    return this.props.product_id
  }

  get quantity(): number {
    return this.props.quantity
  }

  get type(): Type {
    return this.props.type
  }

  get createdAt(): Date {
    return this.props.createdAt!
  }

  get createdBy(): string {
    return this.props.created_by
  }

  
  toJSON(): StockMovementProps {
    return { ...this.props }
  }
}