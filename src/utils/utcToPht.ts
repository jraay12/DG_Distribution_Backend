export function toPHT(date: Date | string): Date {
  const d = new Date(date);

  // PHT = UTC + 8 hours
  const offsetMs = 8 * 60 * 60 * 1000;

  return new Date(d.getTime() + offsetMs);
}