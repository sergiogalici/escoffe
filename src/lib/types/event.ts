/**
 * History log entry — recorded when an ingredient leaves the pantry.
 *
 * Every consumed/wasted action appends one of these. The log is append-only
 * and timestamped, so richer statistics (trends, shelf-life, seasonality) can
 * be derived later without changing the data shape.
 */
export type IngredientOutcome = "consumed" | "wasted";

export interface IngredientEvent {
  /** Stable unique identifier (UUID v4). */
  id: string;
  /** Name of the ingredient at the time it was logged. */
  name: string;
  /** Normalized key linking this event to a catalog entry. */
  key: string;
  /** What happened to it. */
  outcome: IngredientOutcome;
  /** ISO timestamp of when the outcome was recorded. */
  loggedAt: string;
  /** ISO timestamp of when the item was originally added (for shelf-life stats). */
  addedAt: string;
  /** The item's expiration date (YYYY-MM-DD), kept for future analysis. */
  expirationDate: string;
}
