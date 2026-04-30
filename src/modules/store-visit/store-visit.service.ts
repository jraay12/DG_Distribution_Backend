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
export class StoreVisitService {
  constructor(
    private storeVisitRepository: StoreVisitRepository,
    private customerRepository: CustomerRepository,
    private userRepository: UserRepository,
    private prisma: ExtendedPrismaClient,
  ) {}

  async save(dto: CreateStoreVisitDto): Promise<StoreVisitResponseDto[]> {
    const user = await this.userRepository.findById(dto.user_id);
    if (!user) throw new NotFoundError("User not found");

    if (user.role !== "USER") {
      throw new BadRequestError("Only agent role can be assigned");
    }

    const customers = await this.customerRepository.findManyByIds(
      dto.customer_id,
    );

    if (customers.length !== dto.customer_id.length) {
      throw new NotFoundError("One or more stores not found");
    }

    const existing =
      await this.storeVisitRepository.findByUserAndCustomersAndDate(
        dto.user_id,
        dto.customer_id,
        start,
        end,
      );

    const existingIds = new Set(existing.map((v) => v.customerId));

    const validCustomerIds = dto.customer_id.filter(
      (id) => !existingIds.has(id),
    );

    if (validCustomerIds.length === 0) {
      throw new ConflictError("All stores already visited today");
    }

    const storeVisits = validCustomerIds.map((customer_id) =>
      StoreVisit.create({
        user_id: dto.user_id,
        customer_id,
      }),
    );

    await this.prisma.$transaction(async (tx) => {
      await this.storeVisitRepository.saveMany(storeVisits, tx as typeof this.prisma,);
      await this.storeVisitRepository.saveHistory({
        user_id: dto.user_id,
        customer_id: validCustomerIds,
      }, tx as typeof this.prisma,);
    });

    return storeVisits.map((visit) => visit.toJSON());
  }
}
