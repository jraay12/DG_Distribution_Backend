import { DailyReportStatus } from "@prisma/client";
import { ExtendedPrismaClient } from "../../config/prisma";

export class DailyReportRepository {
  constructor(private prisma: ExtendedPrismaClient) {}

  create(data: { id: string; user_id: string; report_date: Date; summary: string }) {
    return this.prisma.dailyReport.create({ data });
  }

  findByUserAndDate(user_id: string, report_date: Date) {
    return this.prisma.dailyReport.findUnique({
      where: { user_id_report_date: { user_id, report_date } },
    });
  }

  findById(id: string) {
    return this.prisma.dailyReport.findUnique({ where: { id } });
  }

  findByUser(user_id: string) {
    return this.prisma.dailyReport.findMany({
      where: { user_id },
      orderBy: { report_date: "desc" },
    });
  }

  findAll(filters: { user_id?: string; status?: DailyReportStatus; from?: Date; to?: Date }) {
    return this.prisma.dailyReport.findMany({
      where: {
        user_id: filters.user_id,
        status: filters.status,
        report_date: filters.from || filters.to ? { gte: filters.from, lte: filters.to } : undefined,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { report_date: "desc" },
    });
  }

  review(id: string, data: { status: DailyReportStatus; admin_remarks?: string; corrected_summary?: string; verified_by: string }) {
    return this.prisma.dailyReport.update({
      where: { id },
      data: { ...data, reviewedAt: new Date() },
    });
  }
}
