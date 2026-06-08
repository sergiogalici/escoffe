/**
 * Ingredient store — the app's single source of truth.
 *
 * Built on Svelte 5 runes ($state / $derived). Module-level reactive state is
 * shared across the whole app. Every mutation persists through the persistence
 * layer; the store itself never imports the Tauri plugin directly.
 */
import type { Ingredient, IngredientDraft } from "../types/ingredient";
import { loadIngredients, saveIngredients } from "../persistence/store";
import { notifyExpiring } from "../persistence/notify";
import { byExpiration, expiringSoon } from "../calendar/expiration";

// --- Reactive state --------------------------------------------------------

let items = $state<Ingredient[]>([]);
let ready = $state(false);

// --- Internal helpers ------------------------------------------------------

/** Persist the current array. Fire-and-forget; logs on failure. */
function persist(): void {
  saveIngredients(items).catch((err) =>
    console.error("Failed to persist ingredients:", err),
  );
}

function newId(): string {
  return crypto.randomUUID();
}

// --- Public API ------------------------------------------------------------

export const ingredients = {
  /** All ingredients, sorted by soonest expiration. */
  get list(): Ingredient[] {
    return [...items].sort(byExpiration);
  },

  /** True once the initial load from disk has completed. */
  get ready(): boolean {
    return ready;
  },

  /** Total number of ingredients. */
  get count(): number {
    return items.length;
  },

  /** Ingredients expired or expiring within the "soon" window. */
  get atRisk(): Ingredient[] {
    return expiringSoon(items).sort(byExpiration);
  },

  /** Load persisted data and fire an expiry notification. Call once on mount. */
  async init(): Promise<void> {
    items = await loadIngredients();
    ready = true;
    notifyExpiring(items).catch(() => {
      /* notifications are best-effort */
    });
  },

  /** Add a new ingredient from a draft. Returns the created entity. */
  add(draft: IngredientDraft): Ingredient {
    const ingredient: Ingredient = { id: newId(), ...draft };
    items = [...items, ingredient];
    persist();
    return ingredient;
  },

  /** Update an existing ingredient by id. */
  update(id: string, patch: Partial<IngredientDraft>): void {
    items = items.map((i) => (i.id === id ? { ...i, ...patch } : i));
    persist();
  },

  /** Remove an ingredient by id. */
  remove(id: string): void {
    items = items.filter((i) => i.id !== id);
    persist();
  },
};
