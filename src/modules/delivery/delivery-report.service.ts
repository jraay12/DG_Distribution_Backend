import { DeliveryReport } from "./delivery-report.entity";
import { DeliveryRepository } from "./delivery.repository";
import { CreateDeliveryReportDTO } from "./dto/CreateDeliveryReportDTO";
import { GpsLogs } from "./gps-log.entity";
import { ImageEvidence } from "./image-evidence.entity";
import { getPresignedUrl } from "../../utils/awsS3";

export class DeliveryService {
  constructor(private deliveryRepository: DeliveryRepository) {}

  async save(dto: CreateDeliveryReportDTO): Promise<void> {
    const latitudeToFloat = parseFloat(dto.latitude as any)
    const longitudeToFloat = parseFloat(dto.longitude as any)
    const delivery = DeliveryReport.save({
      customer_id: dto.customer_id,
      date: dto.date,
      remarks: dto.remarks,
      user_id: dto.user_id,
    });
    const gps = GpsLogs.save({
      delivery_id: delivery.id,
      latitude: latitudeToFloat,
      longitude: longitudeToFloat,
    });
    const evidence = ImageEvidence.save({
      delivery_id: delivery.id,
      image_path: dto.image_path,
    });


    await this.deliveryRepository.save(delivery, gps, evidence);

  }
}
