import crypto from "crypto";
import { DailyReportStatus } from "@prisma/client";
import { BadRequestError } from "../../utils/error/BadRequestError";
import { ConflictError } from "../../utils/error/ConflictError";
import { NotFoundError } from "../../utils/error/NotFoundError";
import { DailyReportRepository } from "./daily-report.repository";

export class DailyReportService {
  constructor(private reportRepo: DailyReportRepository) {}

  private normalizeDate(value: string | Date): Date {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) throw new BadRequestError("Invalid report date");
    date.setUTCHours(0, 0, 0, 0);
    return date;
  }

  async submit(user_id: string, data: { report_date: string | Date; summary: string }) {
    if (!data.summary?.trim()) throw new BadRequestError("Report summary is required");
    const report_date = this.normalizeDate(data.report_date);
    if (await this.reportRepo.findByUserAndDate(user_id, report_date)) {
      throw new ConflictError("A daily report has already been submitted for this date");
    }
    return this.reportRepo.create({
      id: crypto.randomUUID(), user_id, report_date, summary: data.summary.trim(),
    });
  }

  getMine(user_id: string) {
    return this.reportRepo.findByUser(user_id);
  }

  getAll(filters: { user_id?: string; status?: string; from?: string; to?: string }) {
    const status = filters.status?.toUpperCase();
    if (status && !Object.values(DailyReportStatus).includes(status as DailyReportStatus)) {
      throw new BadRequestError("Invalid daily report status");
    }
    return this.reportRepo.findAll({
      user_id: filters.user_id,
      status: status as DailyReportStatus | undefined,
      from: filters.from ? this.normalizeDate(filters.from) : undefined,
      to: filters.to ? this.normalizeDate(filters.to) : undefined,
    });
  }

  async review(id: string, admin_id: string, data: { status: string; admin_remarks?: string; corrected_summary?: string }) {
    const report = await this.reportRepo.findById(id);
    if (!report) throw new NotFoundError("Daily report not found");
    const status = data.status?.toUpperCase() as DailyReportStatus;
    if (status !== DailyReportStatus.VERIFIED && status !== DailyReportStatus.CORRECTED) {
      throw new BadRequestError("Review status must be VERIFIED or CORRECTED");
    }
    if (status === DailyReportStatus.CORRECTED && !data.admin_remarks?.trim()) {
      throw new BadRequestError("Admin remarks are required when correcting a report");
    }
    if (status === DailyReportStatus.CORRECTED && !data.corrected_summary?.trim()) {
      throw new BadRequestError("Corrected summary is required when correcting a report");
    }
    return this.reportRepo.review(id, {
      status,
      admin_remarks: data.admin_remarks?.trim(),
      corrected_summary: data.corrected_summary?.trim(),
      verified_by: admin_id,
    });
  }
}
