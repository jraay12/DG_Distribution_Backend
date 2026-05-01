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
          visit_date: storeVisit.visit_date
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

  async findExistingVisits(
  user_id: string,
  visits: { customer_id: string; visit_date: Date }[],
) {
  if (visits.length === 0) return [];

  return this.prisma.storeVisit.findMany({
    where: {
      user_id,
      OR: visits.map(v => ({
        customer_id: v.customer_id,
        visit_date: v.visit_date,
      })),
    },
    select: {
      id: true,
      customer_id: true,
      visit_date: true,
    },
  });
}

}
