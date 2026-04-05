import { BadRequestError } from "../../utils/error/BadRequestError";

export interface GpsLogProps {
  id: string
  delivery_id: string
  latitude: number
  longitude: number
  createdAt?: Date;
  updatedAt?: Date;
}
export class GpsLogs {
  private props: GpsLogProps

  constructor(props: GpsLogProps){
    this.props = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date()
    }
  }

  static save(props: Omit<GpsLogProps, "id" | "createdAt" | "updatedAt">) {
    if(!props.delivery_id) throw new BadRequestError("Delivery ID is required")
    if (props.latitude === undefined || props.latitude < -90 || props.latitude > 90) {
      throw new BadRequestError("Invalid latitude. Must be between -90 and 90.");
    }

    if (props.longitude === undefined || props.longitude < -180 || props.longitude > 180) {
      throw new BadRequestError("Invalid longitude. Must be between -180 and 180.");
    }

    return new GpsLogs({...props, id: crypto.randomUUID()})
  }


  get id(): string {
    return this.props.id
  }

  get deliveryId(): string {
    return this.props.delivery_id
  }

  get latitude(): number {
    return this.props.latitude
  }

  get longitude(): number {
    return this.props.longitude
  }

  get createdAt(): Date {
    return this.props.createdAt!
  }

  get updatedAt(): Date {
    return this.props.updatedAt!
  }
}