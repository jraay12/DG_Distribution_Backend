import crypto from "crypto";
import { BadRequestError } from "../../utils/error/BadRequestError";
import { ForbiddenError } from "../../utils/error/ForbiddenError";
import { NotFoundError } from "../../utils/error/NotFoundError";
import { StoreVisitRepository } from "../store-visit/store-visit.repository";
import { ActivityRepository } from "./activity.repository";

export class ActivityService {
  constructor(private activityRepo: ActivityRepository, private visitRepo: StoreVisitRepository) {}

  private date(value?: string): Date | undefined {
    if (!value) return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) throw new BadRequestError("Invalid date");
    return date;
  }

  async recordLocation(user_id: string, data: { latitude: number; longitude: number; store_visit_id?: string }) {
    const latitude = Number(data.latitude);
    const longitude = Number(data.longitude);
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      throw new BadRequestError("Latitude must be between -90 and 90");
    }
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      throw new BadRequestError("Longitude must be between -180 and 180");
    }
    if (data.store_visit_id) {
      const visit = await this.visitRepo.findById(data.store_visit_id);
      if (!visit) throw new NotFoundError("Store visit not found");
      if (visit.userId !== user_id) throw new ForbiddenError("Location can only be attached to your own visit");
    }
    return this.activityRepo.createLocation({
      id: crypto.randomUUID(), user_id, store_visit_id: data.store_visit_id, latitude, longitude,
    });
  }

  getLocations(filters: { user_id?: string; from?: string; to?: string }) {
    return this.activityRepo.getLocations({
      user_id: filters.user_id, from: this.date(filters.from), to: this.date(filters.to),
    });
  }

  getAgentActivities(filters: { user_id?: string; visit_date?: string }) {
    return this.activityRepo.getAgentActivities({
      user_id: filters.user_id,
      visit_date: this.date(filters.visit_date),
    });
  }
}
