import { ExtendedPrismaClient } from "../../config/prisma";

export class ActivityRepository {
  constructor(private prisma: ExtendedPrismaClient) {}

  createLocation(data: { id: string; user_id: string; store_visit_id?: string; latitude: number; longitude: number }) {
    return this.prisma.agentLocation.create({ data });
  }

  getLocations(filters: { user_id?: string; from?: Date; to?: Date }) {
    return this.prisma.agentLocation.findMany({
      where: {
        user_id: filters.user_id,
        recordedAt: filters.from || filters.to ? { gte: filters.from, lte: filters.to } : undefined,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        storeVisit: { include: { customer: true } },
      },
      orderBy: { recordedAt: "desc" },
    });
  }

  getAgentActivities(filters: { user_id?: string; visit_date?: Date }) {
    return this.prisma.storeVisit.findMany({
      where: { user_id: filters.user_id, visit_date: filters.visit_date },
      include: {
        user: { select: { id: true, name: true, email: true, isActive: true } },
        customer: true,
        transaction: {
          include: { items: { include: { product: true } }, promoCode: true },
        },
        deliveryReports: {
          include: { gpsLog: true, imageEvidence: true },
        },
        locations: { orderBy: { recordedAt: "asc" } },
      },
      orderBy: [{ visit_date: "desc" }, { createdAt: "asc" }],
    });
  }
}
