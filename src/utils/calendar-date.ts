import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { BadRequestError } from "./error/BadRequestError";

export const manilaTimeZone = "Asia/Manila";

// Calendar dates are stored at UTC midnight. Actual timestamps are compared in Manila time.
export function calendarDate(value: unknown, field: string, allowTimestamp = false): Date {
  if (allowTimestamp && typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    calendarDate(value.slice(0, 10), field);
    const timestamp = new Date(value);
    if (Number.isFinite(timestamp.getTime()) && /(?:Z|[+-]\d{2}:\d{2})$/.test(value)) {
      value = formatInTimeZone(timestamp, manilaTimeZone, "yyyy-MM-dd");
    }
  }
  if (typeof value !== "string" || !/^[1-9]\d{3}-\d{2}-\d{2}$/.test(value)) {
    throw new BadRequestError(`${field} must be a valid date (YYYY-MM-DD)`);
  }
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new BadRequestError(`${field} must be a valid date (YYYY-MM-DD)`);
  }
  return date;
}

export function dateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function nextDate(date: Date): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + 1);
  return next;
}

export function manilaMidnight(date: Date): Date {
  return fromZonedTime(`${dateString(date)}T00:00:00`, manilaTimeZone);
}

export function visitDateRange(query: { visit_date?: unknown; from?: unknown; to?: unknown }) {
  if (query.visit_date !== undefined) {
    if (query.from !== undefined || query.to !== undefined) {
      throw new BadRequestError("Use visit_date or a from/to range");
    }
    const date = calendarDate(query.visit_date, "visit_date", true);
    return { gte: manilaMidnight(date), lt: manilaMidnight(nextDate(date)) };
  }
  const from = query.from === undefined ? undefined : calendarDate(query.from, "from");
  const to = query.to === undefined ? undefined : calendarDate(query.to, "to");
  if (from && to && from > to) throw new BadRequestError("from must be on or before to");
  return { gte: from && manilaMidnight(from), lt: to && manilaMidnight(nextDate(to)) };
}
