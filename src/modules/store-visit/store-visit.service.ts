import { formatInTimeZone } from "date-fns-tz";
import { calendarDate, manilaTimeZone, visitDateRange } from "../../utils/calendar-date";
import { isUniqueViolation, requiredText } from "../../utils/input";
import { StoreVisitRepository } from "./store-visit.repository";
import { CreateStoreVisitDto } from "./dto/CreateDTO";
import { StoreVisitResponseDto } from "./dto/ResponseDTO";
import { StoreVisit } from "./store-visit.entity";
import { CustomerRepository } from "../customer/customer.repository";
import { UserRepository } from "../user/user.repository";
import { NotFoundError } from "../../utils/error/NotFoundError";
import { BadRequestError } from "../../utils/error/BadRequestError";
import { ConflictError } from "../../utils/error/ConflictError";
import { ForbiddenError } from "../../utils/error/ForbiddenError";
import { PreviousRouteAssignResponseDTO } from "./dto/PreviousRouteAssignResponseDTO";
import { GetAssignedResponseDTO } from "./dto/GetAssignedResponseDTO";
import { toPHT } from "../../utils/utcToPht";
import { getStayDuration } from "../../utils/stayDuration";
import { Payload } from "../../utils/jwt";

export class StoreVisitService {
  constructor(
    private storeVisitRepository: StoreVisitRepository,
    private customerRepository: CustomerRepository,
    private userRepository: UserRepository,
  ) {}

  async save(dto: CreateStoreVisitDto): Promise<StoreVisitResponseDto[]> {
    const user_id = requiredText(dto?.user_id, "user_id");
    const user = await this.userRepository.findById(user_id);
    if (!user) throw new NotFoundError("User not found");
    if (user.role !== "USER" || !user.isActive) throw new BadRequestError("An active agent is required");

    let planned: { customer_id: string; visit_date: Date }[];
    if (dto.territory !== undefined) {
      if (dto.visits !== undefined) throw new BadRequestError("Provide a territory or individual visits");
      const territory = requiredText(dto.territory, "territory");
      const visit_date = calendarDate(dto.visit_date, "visit_date", true);
      const customers = await this.customerRepository.getCustomers("active", territory);
      if (!customers.length) throw new NotFoundError("No active stores found in this territory");
      planned = customers.map(({ id }) => ({ customer_id: id, visit_date }));
    } else {
      if (!Array.isArray(dto.visits) || !dto.visits.length) {
        throw new BadRequestError("Provide at least one visit");
      }
      planned = dto.visits.map((visit) => ({
        customer_id: requiredText(visit?.customer_id, "customer_id"),
        visit_date: calendarDate(visit?.visit_date, "visit_date", true),
      }));
      const ids = [...new Set(planned.map(({ customer_id }) => customer_id))];
      if ((await this.customerRepository.findByIds(ids)).length !== ids.length) {
        throw new NotFoundError("One or more stores were not found");
      }
    }
    const keys = new Set(planned.map(({ customer_id, visit_date }) => `${customer_id}/${visit_date.toISOString()}`));
    if (keys.size !== planned.length) throw new BadRequestError("Duplicate store and visit date");
    const visits = planned.map((visit) => StoreVisit.create({ ...visit, user_id }));
    await this.requireAvailableSchedule(user_id, planned);
    try {
      await this.storeVisitRepository.saveMany(visits);
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
      throw new ConflictError("The agent already has this store assigned on the selected date");
    }
    return visits.map((visit) => visit.toJSON());
  }

  async getPreviousAssignRoute(
    user_id: string,
  ): Promise<PreviousRouteAssignResponseDTO[]> {
    const user_exist = await this.userRepository.findById(user_id);
    if (!user_exist) throw new NotFoundError("User does not exists");

    const latest_date =
      await this.storeVisitRepository.latestAssignDate(user_id);
    if (!latest_date) return [];
    const visit_date = formatInTimeZone(latest_date.visitDate, manilaTimeZone, "yyyy-MM-dd");
    const previousRoutes = await this.storeVisitRepository.getPreviousRoutes(
      user_id, visitDateRange({ visit_date }),
    );

    return previousRoutes.map((previousRoute) => ({
      id: previousRoute.id,
      customer_id: previousRoute.customer_id,
      owner_name: previousRoute.customer.owner_name,
      store_name: previousRoute.customer.store_name,
      user_id: previousRoute.user_id,
      visit_date: previousRoute.visit_date,
    }));
  }

  async usePreviousAssignedRoutes(user_id: string, visit_date: string): Promise<StoreVisitResponseDto[]> {
    calendarDate(visit_date, "visit_date", true);
    const previous = await this.getPreviousAssignRoute(user_id);
    if (!previous.length) throw new NotFoundError("No previous routes found");
    return this.save({
      user_id,
      visits: previous.map(({ customer_id }) => ({ customer_id, visit_date })),
    });
  }

  async list(
    query: { visit_date?: unknown; from?: unknown; to?: unknown; territory?: unknown },
    requester: Payload,
    user_id?: string,
  ): Promise<GetAssignedResponseDTO[]> {
    if (requester.role === "USER" && requester.user_id !== user_id) {
      throw new ForbiddenError("You can only view your own assigned routes");
    }
    if (user_id && !await this.userRepository.findById(user_id)) throw new NotFoundError("User not found");
    const visits = await this.storeVisitRepository.list({
      user_id,
      visit_date: visitDateRange(query),
      territory: query.territory === undefined ? undefined : requiredText(query.territory, "territory"),
    });
    return visits.map((visit) => ({
      id: visit.id,
      customer_id: visit.customer_id,
      ...visit.customer,
      user_id: visit.user_id,
      visit_date: visit.visit_date,
      time_in: visit.time_in ? toPHT(visit.time_in) : null,
      time_out: visit.time_out ? toPHT(visit.time_out) : null,
      stay_duration: getStayDuration(visit.time_in, visit.time_out),
      status: visit.time_in && visit.time_out ? "VISITED" : visit.time_in || visit.time_out ? "ONGOING" : "NOT VISITED",
      inventory_counted: visit._count.inventoryItems > 0,
      order_id: visit.order?.id ?? null,
    }));
  }

  async deleteAssignedRoute(id: string): Promise<void> {
    const existing_store_visit = await this.storeVisitRepository.findById(id);
    if (!existing_store_visit)
      throw new NotFoundError("Store visit doesn't exist");

    existing_store_visit.delete();
    const result = await this.storeVisitRepository.deleteAssignedRoutes(id);
    if (!result.count) throw new ConflictError("The route has changed");
  }

  async markTimeIn(id: string, user_id: string): Promise<void> {
    const existing_store_visit = await this.storeVisitRepository.findById(id);
    if (!existing_store_visit)
      throw new NotFoundError("Store visit doesn't exist");

    if (existing_store_visit.userId !== user_id)
      throw new ForbiddenError("You are only allowed to mark your own routes");

    existing_store_visit.markTimeIn();
    const result = await this.storeVisitRepository.recordTime(existing_store_visit, "time_in");
    if (!result.count) throw new ConflictError("The route has changed");
  }

  async markTimeOut(id: string, user_id: string): Promise<void> {
    const existing_store_visit = await this.storeVisitRepository.findById(id);
    if (!existing_store_visit)
      throw new NotFoundError("Store visit doesn't exist");

    if (existing_store_visit.userId !== user_id)
      throw new ForbiddenError("You are only allowed to mark your own routes");

    existing_store_visit.markTimeOut();
    const result = await this.storeVisitRepository.recordTime(existing_store_visit, "time_out");
    if (!result.count) throw new ConflictError("The route has changed");
  }

  async reassignRoute(id: string, data: { user_id: string; customer_id: string; visit_date: string }) {
    const existing = await this.storeVisitRepository.findById(id);
    if (!existing) throw new NotFoundError("Store visit doesn't exist");
    if (existing.time_in || existing.time_out) {
      throw new BadRequestError("A route already in progress cannot be reassigned");
    }
    const user_id = requiredText(data?.user_id, "user_id");
    const customer_id = requiredText(data?.customer_id, "customer_id");
    const visit_date = calendarDate(data?.visit_date, "visit_date", true);
    const [user, customer] = await Promise.all([
      this.userRepository.findById(user_id),
      this.customerRepository.findById(customer_id),
    ]);
    if (!user || user.role !== "USER" || !user.isActive) throw new BadRequestError("A valid active agent is required");
    if (!customer || customer.deletedAt) throw new NotFoundError("Store not found");
    await this.requireAvailableSchedule(user_id, [{ customer_id, visit_date }], id);
    try {
      return await this.storeVisitRepository.reassign(id, {
        user_id, customer_id, visit_date,
      });
    } catch (error) {
      if (isUniqueViolation(error)) throw new ConflictError("The agent already has this store assigned on the selected date");
      if (typeof error === "object" && error && "code" in error && error.code === "P2025") {
        throw new ConflictError("The route has changed");
      }
      throw error;
    }
  }
  private async requireAvailableSchedule(
    user_id: string,
    visits: { customer_id: string; visit_date: Date }[],
    excludedId?: string,
  ) {
    if (await this.storeVisitRepository.findScheduleConflict(user_id, visits, excludedId)) {
      throw new ConflictError("The agent already has this store assigned on the selected date");
    }
  }
}
