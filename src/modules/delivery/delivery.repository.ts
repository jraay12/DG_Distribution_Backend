import { ExtendedPrismaClient } from "../../config/prisma";
import { DeliveryReport } from "./delivery-report.entity";
import { GpsLogs } from "./gps-log.entity";
import { ImageEvidence } from "./image-evidence.entity";

export class DeliveryRepository {
  constructor(private prisma: ExtendedPrismaClient){}

  async save(delivery: DeliveryReport, gpsLogs: GpsLogs, imageEvidence: ImageEvidence): Promise<void> {
    await this.prisma.deliveryReport.create({
      data: {
        id: delivery.id,
        date: delivery.date,
        remarks: delivery.remarks,
        customer_id: delivery.customerId,
        user_id: delivery.userId,
        gpsLog: {
          create: {
            latitude: gpsLogs.latitude,
            longitude: gpsLogs.longitude,
          }
        },
        imageEvidence: {
          create: {
            image_path: imageEvidence.imagePath,
          }
        }
      }
    })
  }
}