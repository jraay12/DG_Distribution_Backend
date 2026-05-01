import { StoreVisitRepository } from "./store-visit.repository";
import { CreateStoreVisitDto } from "./dto/CreateDTO";
import { StoreVisitResponseDto } from "./dto/ResponseDTO";
import { StoreVisit } from "./store-visit.entity";
import { CustomerRepository } from "../customer/customer.repository";
import { UserRepository } from "../user/user.repository";
import { NotFoundError } from "../../utils/error/NotFoundError";
import { BadRequestError } from "../../utils/error/BadRequestError";
import { ConflictError } from "../../utils/error/ConflictError";
import { ExtendedPrismaClient } from "../../config/prisma";
import { ForbiddenError } from "../../utils/error/ForbiddenError";
import { PreviousRouteAssignResponseDTO } from "./dto/PreviousRouteAssignResponseDTO";
import { GetAssignedResponseDTO } from "./dto/GetAssignedResponseDTO";
import { toPHT } from "../../utils/utcToPht";
import { getStayDuration } from "../../utils/stayDuration";

export class StoreVisitService {
  constructor(
    private storeVisitRepository: StoreVisitRepository,
    private customerRepository: CustomerRepository,
    private userRepository: UserRepository,
    private prisma: ExtendedPrismaClient,
  ) {}

  async save(dto: CreateStoreVisitDto): Promise<StoreVisitResponseDto[]> {
    // checker if user exist & user role is USER
    const user = await this.userRepository.findById(dto.user_id);

    if (!user) throw new NotFoundError("User not found");

    if (user.role !== "USER") {
      throw new ForbiddenError("Only users with USER role are allowed");
    }

    // checker ensuring that it will not be duplicated

    const seen = new Set();
    const duplicatesInPayload: string[] = [];

    for (const visit of dto.visits) {
      const key = `${visit.customer_id}_${visit.visit_date}`;

      if (seen.has(key)) {
        duplicatesInPayload.push(key);
      } else {
        seen.add(key);
      }
    }

    if (duplicatesInPayload.length > 0)
      throw new BadRequestError(`Assign routes to the agent is duplicated`);

    // checking for valid customer ids

    const customerIds = dto.visits.map((v) => v.customer_id);

    const customers = await this.customerRepository.findByIds(customerIds);

    const foundIds = new Set(customers.map((customer) => customer.id));

    const missing = customerIds.filter((id) => !foundIds.has(id));

    if (missing.length > 0) {
      throw new NotFoundError(`Stores not found`);
    }

    const storeVisits = dto.visits.map((v) =>
      StoreVisit.create({
        user_id: dto.user_id,
        customer_id: v.customer_id,
        visit_date: v.visit_date,
      }),
    );

    // 4. Save
    try {
      await this.prisma.$transaction(async (tx) => {
        await this.storeVisitRepository.saveMany(
          storeVisits,
          tx as typeof this.prisma,
        );
      });
    } catch (error) {
      throw new ConflictError(
        "User already has a route assigned for the same store on the selected date",
      );
    }

    return storeVisits.map((v) => v.toJSON());
  }

  async getPreviousAssignRoute(
    user_id: string,
  ): Promise<PreviousRouteAssignResponseDTO[]> {
    const user_exist = await this.userRepository.findById(user_id);
    if (!user_exist) throw new NotFoundError("User does not exists");

    const latest_date =
      await this.storeVisitRepository.latestAssignDate(user_id);
    const previousRoutes = await this.storeVisitRepository.getPreviousRoutes(
      user_id,
      latest_date?.visitDate!,
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

  async usePreviousAssignedRoutes(
    user_id: string,
    visit_date: Date,
  ): Promise<StoreVisitResponseDto[]> {
    const user_exist = await this.userRepository.findById(user_id);
    if (!user_exist) throw new NotFoundError("User does not exists");

    const latest_date =
      await this.storeVisitRepository.latestAssignDate(user_id);
    const previousRoutes = await this.storeVisitRepository.getPreviousRoutes(
      user_id,
      latest_date?.visitDate!,
    );

    const storeVisits = previousRoutes.map((previousRoute) =>
      StoreVisit.create({
        user_id: user_id,
        customer_id: previousRoute.customer_id,
        visit_date: visit_date,
      }),
    );

    try {
      await this.storeVisitRepository.saveMany(storeVisits);
    } catch (error) {
      throw new ConflictError(
        "User already has a route assigned for the same store on the selected date",
      );
    }

    return storeVisits.map((storeVisit) => storeVisit.toJSON());
  }

  async getAssignedRoutes(
    user_id: string,
    visit_date?: Date,
  ): Promise<GetAssignedResponseDTO[]> {
    const user_exist = await this.userRepository.findById(user_id);
    if (!user_exist) throw new NotFoundError("User does not exists");

    const store_visits = await this.storeVisitRepository.getAssignedRoutes(
      user_id,
      visit_date,
    );

    return store_visits.map((store_visit) => ({
      id: store_visit.id,
      customer_id: store_visit.customer_id,
      owner_name: store_visit.customer.owner_name,
      store_name: store_visit.customer.store_name,
      user_id: store_visit.user_id,
      visit_date: store_visit.visit_date,
      time_in: store_visit.time_in ? toPHT(store_visit.time_in!) : null,
      time_out: store_visit.time_out ? toPHT(store_visit.time_out!) : null,
      stay_duration: getStayDuration(store_visit.time_in, store_visit.time_out)

    }));
  }

  async deleteAssignedRoute(id: string): Promise<void> {
    const existing_store_visit = await this.storeVisitRepository.findById(id);
    if (!existing_store_visit)
      throw new NotFoundError("Store visit doesn't exist");

    existing_store_visit.delete();
    await this.storeVisitRepository.deleteAssignedRoutes(id);
  }

  async markTimeIn(id: string, user_id: string): Promise<void> {
    const existing_store_visit = await this.storeVisitRepository.findById(id);
    if (!existing_store_visit)
      throw new NotFoundError("Store visit doesn't exist");

    if (existing_store_visit.userId !== user_id)
      throw new ForbiddenError("You are only allowed to mark your own routes");

    existing_store_visit.markTimeIn();
    await this.storeVisitRepository.update(existing_store_visit);
  }

  async markTimeOut(id: string, user_id: string): Promise<void> {
    const existing_store_visit = await this.storeVisitRepository.findById(id);
    if (!existing_store_visit)
      throw new NotFoundError("Store visit doesn't exist");

    if (existing_store_visit.userId !== user_id)
      throw new ForbiddenError("You are only allowed to mark your own routes");

    existing_store_visit.markTimeOut();
    await this.storeVisitRepository.update(existing_store_visit);
  }

   async getAllAssignedRoutes(
    visit_date?: Date,
  ): Promise<GetAssignedResponseDTO[]> {
    const store_visits = await this.storeVisitRepository.getAllAssignedRoutes(
      visit_date,
    );

    return store_visits.map((store_visit) => ({
      id: store_visit.id,
      customer_id: store_visit.customer_id,
      owner_name: store_visit.customer.owner_name,
      store_name: store_visit.customer.store_name,
      user_id: store_visit.user_id,
      visit_date: store_visit.visit_date,
      time_in: store_visit.time_in ? toPHT(store_visit.time_in!) : null,
      time_out: store_visit.time_out ? toPHT(store_visit.time_out!) : null,
      stay_duration: getStayDuration(store_visit.time_in, store_visit.time_out)
    }));
  }
}
