/**
 * Statistics derivation — pure functions over the history event log.
 *
 * No I/O, no framework. The event log is the single input; everything here is
 * a derived view, so new statistics can be added without touching storage.
 */
import type { IngredientEvent, IngredientOutcome } from "../types/event";

export interface IngredientStat {
  name: string;
  key: string;
  consumed: number;
  wasted: number;
  total: number;
  /** Share of this ingredient's outcomes that were wasted (0–1). */
  wasteRate: number;
}

export interface Totals {
  consumed: number;
  wasted: number;
  total: number;
  wasteRate: number;
}

export interface PeriodBucket {
  /** Sort/lookup key, e.g. "2026-06" (month) or "2026" (year). */
  key: string;
  /** Human label, e.g. "Jun 2026" or "2026". */
  label: string;
  consumed: number;
  wasted: number;
}

function rate(wasted: number, total: number): number {
  return total === 0 ? 0 : wasted / total;
}

/** Grand totals across every event. */
export function totals(events: IngredientEvent[]): Totals {
  let consumed = 0;
  let wasted = 0;
  for (const e of events) {
    if (e.outcome === "consumed") consumed++;
    else wasted++;
  }
  const total = consumed + wasted;
  return { consumed, wasted, total, wasteRate: rate(wasted, total) };
}

/** Per-ingredient breakdown, most-active first. */
export function perIngredient(events: IngredientEvent[]): IngredientStat[] {
  const map = new Map<string, IngredientStat>();
  for (const e of events) {
    const stat =
      map.get(e.key) ??
      ({
        name: e.name,
        key: e.key,
        consumed: 0,
        wasted: 0,
        total: 0,
        wasteRate: 0,
      } satisfies IngredientStat);
    stat[e.outcome]++;
    stat.total++;
    map.set(e.key, stat);
  }
  const list = [...map.values()];
  for (const s of list) s.wasteRate = rate(s.wasted, s.total);
  return list.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
}

function bucketBy(
  events: IngredientEvent[],
  keyOf: (d: Date) => string,
  labelOf: (d: Date) => string,
): PeriodBucket[] {
  const map = new Map<string, PeriodBucket>();
  for (const e of events) {
    const d = new Date(e.loggedAt);
    const key = keyOf(d);
    const bucket =
      map.get(key) ?? { key, label: labelOf(d), consumed: 0, wasted: 0 };
    bucket[e.outcome as IngredientOutcome]++;
    map.set(key, bucket);
  }
  return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
}

/** Monthly trend buckets, chronological. */
export function byMonth(events: IngredientEvent[]): PeriodBucket[] {
  return bucketBy(
    events,
    (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    (d) =>
      d.toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
  );
}

/** Yearly trend buckets, chronological. */
export function byYear(events: IngredientEvent[]): PeriodBucket[] {
  return bucketBy(
    events,
    (d) => String(d.getFullYear()),
    (d) => String(d.getFullYear()),
  );
}
