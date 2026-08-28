import { BadRequestError } from "../../utils/error/BadRequestError";
import { NotFoundError } from "../../utils/error/NotFoundError";
import { StoreVisitRepository } from "../store-visit/store-visit.repository";
import { DeliveryReport } from "./delivery-report.entity";
import { DeliveryRepository } from "./delivery.repository";
import { CreateDeliveryReportDTO } from "./dto/CreateDeliveryReportDTO";
import { GetEvidenceResponseDTO } from "./dto/GetEvidenceResponseDTO";
import { SaveNewEvidence } from "./dto/SaveNewEvidenceDTO";
import { GpsLogs } from "./gps-log.entity";
import { ImageEvidence } from "./image-evidence.entity";
import { ForbiddenError } from "../../utils/error/ForbiddenError";
import { Payload } from "../../utils/jwt";

export class DeliveryService {
  constructor(private deliveryRepository: DeliveryRepository, private storeVisitRepository: StoreVisitRepository) {}

  async save(dto: CreateDeliveryReportDTO, user_id: string): Promise<void> {
    const store_visit = await this.storeVisitRepository.findById(dto.store_visit_id)
    if(!store_visit) throw new NotFoundError("Store Visit ID not found")
    if(store_visit.userId !== user_id) throw new ForbiddenError("You can only report your own store visits")
      
    const latitudeToFloat = parseFloat(dto.latitude as any)
    const longitudeToFloat = parseFloat(dto.longitude as any)
    const delivery = DeliveryReport.save({
      store_visit_id: dto.store_visit_id,
      date: dto.date,
      remarks: dto.remarks,
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

  async saveNewEvidence(dto: SaveNewEvidence, user_id: string): Promise<void> {
    const delivery = await this.deliveryRepository.findDeliveryById(dto.id)

    if(!delivery) throw new BadRequestError("Delivery not found")
    const visit = await this.storeVisitRepository.findById(delivery.storeVisitId)
    if(!visit || visit.userId !== user_id) throw new ForbiddenError("You can only add evidence to your own report")

    const evidence = ImageEvidence.save({
      delivery_id: delivery.id,
      image_path: dto.image_path,
    });

    await this.deliveryRepository.saveEvidence(evidence)
  }

  async getAllEvidences(delivery_id: string, requester: Payload): Promise<GetEvidenceResponseDTO[]> {
    const delivery = await this.deliveryRepository.findDeliveryById(delivery_id)

    if(!delivery) throw new BadRequestError("Delivery not found")
    if(requester.role === "USER") {
      const visit = await this.storeVisitRepository.findById(delivery.storeVisitId)
      if(!visit || visit.userId !== requester.user_id) throw new ForbiddenError("You can only view your own evidence")
    }

    const evidence = await this.deliveryRepository.getEvidences(delivery_id)

    return evidence.map(e => e.toJson())
  }
}
