import { BadRequestError } from "../../utils/error/BadRequestError"

export interface ImageEvidenceProps {
  id: string
  delivery_id: string
  image_path: string
  createdAt?: Date
  updatedAt?: Date
}

export class ImageEvidence {
  private props: ImageEvidenceProps

  constructor(props: ImageEvidenceProps) {
    this.props = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    }
  }

  static save(props: Omit<ImageEvidenceProps, "id" | "createdAt" | "updatedAt">) {
    if(!props.delivery_id) throw new BadRequestError("Delivery ID is required")

    return new ImageEvidence({...props, id: crypto.randomUUID()})
  }

  static hydrate(props: ImageEvidenceProps): ImageEvidence {
      return new ImageEvidence(props);
    }

  toJson(): ImageEvidenceProps {
    return { ...this.props };
  }
  

  // Getters
  get id(): string {
    return this.props.id
  }

  get deliveryId(): string {
    return this.props.delivery_id
  }

  get imagePath(): string {
    return this.props.image_path
  }

  get createdAt(): Date {
    return this.props.createdAt!
  }

  get updatedAt(): Date {
    return this.props.updatedAt!
  }
}