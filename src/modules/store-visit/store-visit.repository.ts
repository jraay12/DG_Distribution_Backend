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
          visit_date: storeVisit.visit_date,
        };
      }),
    });
  }

  async getPreviousRoutes(user_id: string, latest_date: Date) {
    return await this.prisma.storeVisit.findMany({
      where: {
        user_id,
        visit_date: latest_date,
      },
      orderBy: {
        visit_date: "desc",
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
  }

  async latestAssignDate(user_id: string): Promise<StoreVisit | null> {
    const record = await this.prisma.storeVisit.findFirst({
      where: {
        user_id,
      },
      orderBy: {
        visit_date: "desc",
      },
    });

    if (!record) return null;

    return StoreVisit.hydrate(record);
  }

  async getAssignedRoutes(user_id: string, visit_date?: Date) {
    const whereClause: any = { user_id: user_id };

    if (visit_date) {
      whereClause.visit_date = visit_date;
    }
    return await this.prisma.storeVisit.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            owner_name: true,
            store_name: true,
          },
        },
      },
      orderBy: {
        visit_date: "asc",
      },
    });
  }

  async deleteAssignedRoutes(id: string): Promise<void> {
    await this.prisma.storeVisit.deleteMany({
      where: {
        id,
      },
    });
  }
}
