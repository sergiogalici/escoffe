/**
 * The core entity of Escoffe: one item currently in the pantry.
 *
 * The active pantry is a collection of these. When an item is consumed or
 * wasted it leaves the pantry and becomes an {@link IngredientEvent} in the
 * history log (see ./event.ts).
 */
export interface Ingredient {
  /** Stable unique identifier (UUID v4). */
  id: string;
  /** Human-readable name, e.g. "Chicken breast". */
  name: string;
  /** Expiration date as an ISO date string (YYYY-MM-DD). */
  expirationDate: string;
  /** Free-form notes — quantity, recipe ideas, anything. */
  notes?: string;
  /** ISO timestamp of when the item was added to the pantry. */
  addedAt: string;
}

/**
 * Shape used by the form when creating/editing.
 * The store generates `id` and `addedAt`.
 */
export type IngredientDraft = Pick<Ingredient, "name" | "expirationDate" | "notes">;
