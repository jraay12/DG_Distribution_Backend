import { dateString, visitDateRange } from "../../utils/calendar-date";
import { Prisma } from "@prisma/client";
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

  lockForOrdering(id: string, tx: ExtendedPrismaClient) {
    return tx.$queryRaw<{ id: string; user_id: string; customer_id: string; time_in: Date | null }[]>`
      SELECT id, user_id, customer_id, time_in
      FROM StoreVisit WHERE id = ${id} AND deletedAt IS NULL FOR UPDATE
    `;
  }

  findScheduleConflict(
    user_id: string,
    visits: { customer_id: string; visit_date: Date }[],
    excludedId?: string,
  ) {
    const storesByDate = new Map<string, string[]>();
    for (const { customer_id, visit_date } of visits) {
      const day = dateString(visit_date);
      const stores = storesByDate.get(day) ?? [];
      stores.push(customer_id);
      storesByDate.set(day, stores);
    }
    return this.prisma.storeVisit.findFirst({
      where: {
        user_id,
        id: excludedId ? { not: excludedId } : undefined,
        deletedAt: null,
        OR: [...storesByDate].map(([visit_date, customerIds]) => ({
          customer_id: { in: customerIds },
          visit_date: visitDateRange({ visit_date }),
        })),
      },
      select: { id: true },
    });
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

  async getPreviousRoutes(user_id: string, visit_date: Prisma.DateTimeFilter) {
    return await this.prisma.storeVisit.findMany({
      where: {
        user_id,
        visit_date,
        deletedAt: null,
        customer: { deletedAt: null },
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
        user_id, deletedAt: null, customer: { deletedAt: null },
      },
      orderBy: {
        visit_date: "desc",
      },
    });

    if (!record) return null;

    return StoreVisit.hydrate(record);
  }

  list(filters: { user_id?: string; visit_date: Prisma.DateTimeFilter; territory?: string }) {
    return this.prisma.storeVisit.findMany({
      where: {
        deletedAt: null,
        user_id: filters.user_id,
        visit_date: filters.visit_date,
        customer: filters.territory === undefined ? undefined : { territory: filters.territory },
      },
      include: {
        customer: {
          select: { owner_name: true, store_name: true, address: true, territory: true },
        },
        _count: { select: { inventoryItems: true } },
        order: { select: { id: true } },
      },
      orderBy: [{ visit_date: "asc" }, { id: "asc" }],
    });
  }

  async deleteAssignedRoutes(id: string) {
    return this.prisma.storeVisit.deleteMany({
      where: {
        id, time_in: null, time_out: null,
      },
    });
  }

  recordTime(visit: StoreVisit, field: "time_in" | "time_out") {
    return this.prisma.storeVisit.updateMany({
      where: { id: visit.id, user_id: visit.userId, deletedAt: null, [field]: null },
      data: { [field]: visit[field] },
    });
  }

  reassign(id: string, data: { user_id: string; customer_id: string; visit_date: Date }) {
    return this.prisma.storeVisit.update({
      where: { id, deletedAt: null, time_in: null, time_out: null },
      data,
    });
  }
}
