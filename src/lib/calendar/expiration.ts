/**
 * Expiration calendar helpers.
 *
 * Pure date math over the `expirationDate` field of an Ingredient. No I/O,
 * no framework — easy to test and reuse.
 */
import type { Ingredient } from "../types/ingredient";

export type ExpirationStatus = "expired" | "critical" | "soon" | "fresh";

/** Items within this many days are considered "critical". */
export const CRITICAL_DAYS = 2;
/** Items within this many days are considered "soon". */
export const SOON_DAYS = 7;

/** Today at local midnight, so comparisons ignore the time of day. */
function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Parse an ISO date (YYYY-MM-DD) into a local-midnight Date. */
function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** Whole days from today until the expiration date (negative if past). */
export function daysUntil(expirationDate: string): number {
  const ms = parseDate(expirationDate).getTime() - startOfToday().getTime();
  return Math.round(ms / 86_400_000);
}

/** Classify an expiration date into a status bucket. */
export function getStatus(expirationDate: string): ExpirationStatus {
  const days = daysUntil(expirationDate);
  if (days < 0) return "expired";
  if (days <= CRITICAL_DAYS) return "critical";
  if (days <= SOON_DAYS) return "soon";
  return "fresh";
}

/** Short human label for a status / day count, e.g. "Expires in 3 days". */
export function expirationLabel(expirationDate: string): string {
  const days = daysUntil(expirationDate);
  if (days < 0) {
    const n = Math.abs(days);
    return n === 1 ? "Expired yesterday" : `Expired ${n} days ago`;
  }
  if (days === 0) return "Expires today";
  if (days === 1) return "Expires tomorrow";
  return `Expires in ${days} days`;
}

/** Format an ISO date for display, e.g. "12 Jun 2026". */
export function formatDate(expirationDate: string): string {
  return parseDate(expirationDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Sort ingredients by soonest expiration first. */
export function byExpiration(a: Ingredient, b: Ingredient): number {
  return daysUntil(a.expirationDate) - daysUntil(b.expirationDate);
}

/** Items that are already expired or expiring within SOON_DAYS. */
export function expiringSoon(items: Ingredient[]): Ingredient[] {
  return items.filter((i) => daysUntil(i.expirationDate) <= SOON_DAYS);
}
