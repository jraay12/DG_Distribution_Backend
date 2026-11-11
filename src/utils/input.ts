import { BadRequestError } from "./error/BadRequestError";

export function requiredText(value: unknown, field: string, maxLength = 191): string {
  if (typeof value !== "string" || !value.trim() || value.trim().length > maxLength) {
    throw new BadRequestError(`${field} must be a non-empty string of at most ${maxLength} characters`);
  }
  return value.trim();
}

export function nonnegativeInteger(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 2147483647) {
    throw new BadRequestError(`${field} must be a non-negative 32-bit integer`);
  }
  return value;
}

export function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}
