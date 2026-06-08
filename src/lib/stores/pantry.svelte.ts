/**
 * Pantry store — the app's single source of truth.
 *
 * Built on Svelte 5 runes ($state). Holds three reactive collections:
 *   - items   : ingredients currently in the pantry
 *   - events  : append-only history log (consumed / wasted)
 *   - catalog : every ingredient name ever entered (for autocomplete)
 *
 * Every mutation persists through the persistence layer. Components mutate
 * state only through the exported `pantry` API; they never touch persistence
 * or the Tauri plugins directly.
 */
import type { Ingredient, IngredientDraft } from "../types/ingredient";
import type { IngredientEvent, IngredientOutcome } from "../types/event";
import type { CatalogEntry } from "../types/catalog";
import {
  loadIngredients,
  saveIngredients,
  loadEvents,
  saveEvents,
  loadCatalog,
  saveCatalog,
} from "../persistence/store";
import { notifyExpiring } from "../persistence/notify";
import { byExpiration, expiringSoon } from "../calendar/expiration";
import { normalize, fuzzySearch } from "../utils/fuzzy";
import * as stats from "../stats/aggregate";

// --- Reactive state --------------------------------------------------------

let items = $state<Ingredient[]>([]);
let events = $state<IngredientEvent[]>([]);
let catalog = $state<CatalogEntry[]>([]);
let ready = $state(false);

// --- Helpers ---------------------------------------------------------------

const now = () => new Date().toISOString();
const newId = () => crypto.randomUUID();

function persistItems() {
  saveIngredients(items).catch((e) => console.error("persist items", e));
}
function persistEvents() {
  saveEvents(events).catch((e) => console.error("persist events", e));
}
function persistCatalog() {
  saveCatalog(catalog).catch((e) => console.error("persist catalog", e));
}

/** Record (or bump) a name in the catalog. */
function rememberName(name: string) {
  const key = normalize(name);
  if (!key) return;
  const existing = catalog.find((c) => c.key === key);
  if (existing) {
    catalog = catalog.map((c) =>
      c.key === key ? { ...c, uses: c.uses + 1 } : c,
    );
  } else {
    catalog = [...catalog, { name: name.trim(), key, addedAt: now(), uses: 1 }];
  }
  persistCatalog();
}

// --- Public API: ingredients ----------------------------------------------

export const pantry = {
  get ready() {
    return ready;
  },
  /** Active items, soonest expiration first. */
  get items(): Ingredient[] {
    return [...items].sort(byExpiration);
  },
  get count(): number {
    return items.length;
  },
  /** Items expired or expiring within the "soon" window. */
  get atRisk(): Ingredient[] {
    return expiringSoon(items).sort(byExpiration);
  },

  /** Load persisted data and fire an expiry notification. Call once on mount. */
  async init(): Promise<void> {
    [items, events, catalog] = await Promise.all([
      loadIngredients(),
      loadEvents(),
      loadCatalog(),
    ]);
    ready = true;
    notifyExpiring(items).catch(() => {
      /* notifications are best-effort */
    });
  },

  /** Add a new ingredient and remember its name. */
  add(draft: IngredientDraft): Ingredient {
    const ingredient: Ingredient = {
      id: newId(),
      addedAt: now(),
      name: draft.name.trim(),
      expirationDate: draft.expirationDate,
      notes: draft.notes,
    };
    items = [...items, ingredient];
    persistItems();
    rememberName(ingredient.name);
    return ingredient;
  },

  /** Edit an existing ingredient. */
  update(id: string, patch: Partial<IngredientDraft>): void {
    items = items.map((i) => (i.id === id ? { ...i, ...patch } : i));
    persistItems();
    if (patch.name) rememberName(patch.name);
  },

  /** Delete an ingredient without logging an outcome (correcting a mistake). */
  remove(id: string): void {
    items = items.filter((i) => i.id !== id);
    persistItems();
  },

  /**
   * Mark an item as consumed or wasted: append a history event and remove it
   * from the active pantry.
   */
  mark(id: string, outcome: IngredientOutcome): void {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const event: IngredientEvent = {
      id: newId(),
      name: item.name,
      key: normalize(item.name),
      outcome,
      loggedAt: now(),
      addedAt: item.addedAt,
      expirationDate: item.expirationDate,
    };
    events = [...events, event];
    items = items.filter((i) => i.id !== id);
    persistEvents();
    persistItems();
  },

  /** Fuzzy name suggestions from the catalog (most-used first on ties). */
  suggest(query: string, limit = 6): CatalogEntry[] {
    return fuzzySearch(query, catalog, (c) => c.name, limit);
  },
};

// --- Public API: catalog ---------------------------------------------------

export const ingredientCatalog = {
  /** All known names, alphabetical. */
  get entries(): CatalogEntry[] {
    return [...catalog].sort((a, b) => a.name.localeCompare(b.name));
  },
  get count(): number {
    return catalog.length;
  },
};

// --- Public API: statistics (derived from the event log) -------------------

export const statistics = {
  get totals() {
    return stats.totals(events);
  },
  get perIngredient() {
    return stats.perIngredient(events);
  },
  get byMonth() {
    return stats.byMonth(events);
  },
  get byYear() {
    return stats.byYear(events);
  },
  get eventCount(): number {
    return events.length;
  },
  /** Enough history to draw meaningful monthly trends. */
  get hasMonthlyTrend(): boolean {
    return stats.byMonth(events).length >= 2;
  },
  /** Enough history to draw meaningful yearly trends. */
  get hasYearlyTrend(): boolean {
    return stats.byYear(events).length >= 2;
  },
};
