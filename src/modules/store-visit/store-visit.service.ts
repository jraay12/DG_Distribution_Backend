import { StoreVisitRepository } from "./store-visit.repository";
import { CreateStoreVisitDto } from "./dto/CreateDTO";
import { StoreVisitResponseDto } from "./dto/ResponseDTO";
import { StoreVisit } from "./store-visit.entity";
import { CustomerRepository } from "../customer/customer.repository";
import { UserRepository } from "../user/user.repository";
import { NotFoundError } from "../../utils/error/NotFoundError";
import { BadRequestError } from "../../utils/error/BadRequestError";
import { start, end } from "../../utils/convertToPHTTime";
import { ConflictError } from "../../utils/error/ConflictError";
import { ExtendedPrismaClient } from "../../config/prisma";
import { ForbiddenError } from "../../utils/error/ForbiddenError";

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
}
