import { ExtendedPrismaClient } from "../../config/prisma";
import { StoreVisit } from "./store-visit.entity";

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
    const record =  await this.prisma.storeVisit.findMany({
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

    return record.map((a) => StoreVisit.hydrate(a))
  }

  async saveHistory(dto: {user_id: string, customer_id: string[]}, tx?: typeof this.prisma) : Promise<void>{
    const client = tx ?? (this.prisma as ExtendedPrismaClient);

    await client?.storeVisitHistory.createMany({
      data: dto.customer_id.map((customer_id) => {
        return {
          customer_id,
          user_id: dto.user_id
        }
      })
    })
  }
}
