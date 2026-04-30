import { StoreVisitHistory } from "@prisma/client";
import { ExtendedPrismaClient } from "../../config/prisma";
import { StoreVisit } from "./store-visit.entity";
import {
  ResponseStoreVisitHistoryDTO,
  ResponseStoreVisitHistoryWithCustomerDTO,
} from "./dto/ResponseStoreHistory";

export class StoreVisitRepository {
  constructor(private prisma: ExtendedPrismaClient) {}

  async findById(id: string): Promise<StoreVisit | null> {
    const store_visit = await this.prisma.storeVisit.findUnique({
      where: {
        id,
      },
    });

    if (!store_visit) return null;

    return StoreVisit.hydrate(store_visit);
  }

  async saveMany(data: StoreVisit[], tx?: typeof this.prisma): Promise<void> {
    const client = tx ?? (this.prisma as ExtendedPrismaClient);

    await client.storeVisit.createMany({
      data: data.map((visit) => {
        const storeVisit = visit.toJSON();

        return {
          id: storeVisit.id,
          user_id: storeVisit.user_id,
          customer_id: storeVisit.customer_id,
          deletedAt: storeVisit.deletedAt,
        };
      }),
    });
  }

  async findByUserAndCustomersAndDate(
    user_id: string,
    customer_ids: string[],
    start: Date,
    end: Date,
  ): Promise<StoreVisit[]> {
    const record = await this.prisma.storeVisit.findMany({
      where: {
        user_id,
        customer_id: {
          in: customer_ids,
        },
        createdAt: {
          gte: start,
          lte: end,
        },
        deletedAt: null,
      },
    });

    return record.map((a) => StoreVisit.hydrate(a));
  }

  async saveHistory(
    dto: { user_id: string; customer_id: string[] },
    tx?: typeof this.prisma,
  ): Promise<void> {
    const client = tx ?? (this.prisma as ExtendedPrismaClient);

    await client.storeVisitHistory.createMany({
      data: dto.customer_id.map((customer_id) => ({
        user_id: dto.user_id,
        customer_id,
      })),
    });
  }

  async deleteStoreVisitHistory(
    user_id: string,
    tx?: typeof this.prisma,
  ): Promise<void> {
    const client = tx ?? (this.prisma as ExtendedPrismaClient);

    await client.storeVisitHistory.deleteMany({
      where: {
        user_id: user_id,
      },
    });
  }

  async findStoreVisitHistoryToday(
    user_id: string,
    start: Date,
    end: Date,
    tx?: typeof this.prisma,
  ): Promise<ResponseStoreVisitHistoryDTO | null> {
    const client = tx ?? (this.prisma as ExtendedPrismaClient);

    const record = await client.storeVisitHistory.findFirst({
      where: {
        user_id,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    if (!record) return null;

    return {
      id: record.id,
      customer_id: record.customer_id,
      user_id: record.user_id,
    };
  }

  async getStoreVisitHistory(
    user_id: string,
  ): Promise<ResponseStoreVisitHistoryWithCustomerDTO[]> {
    const record = await this.prisma.storeVisitHistory.findMany({
      where: {
        user_id,
      },
      include: {
        customer: {
          select: {
            store_name: true,
            owner_name: true,
          },
        },
      },
    });

    return record.map((e) => ({
      id: e.id,
      owner_name: e.customer.owner_name,
      store_name: e.customer.store_name,
      user_id: e.user_id,
      store_id: e.customer_id,
    }));
  }
}
