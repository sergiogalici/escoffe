/**
 * Persistence layer.
 *
 * The ONLY place that touches disk. Uses @tauri-apps/plugin-store to read and
 * write three arrays — active ingredients, the history event log, and the name
 * catalog — under three keys in one JSON file. The rest of the app never
 * imports the plugin directly; swap this file to change the backend.
 */
import { load, type Store } from "@tauri-apps/plugin-store";
import type { Ingredient } from "../types/ingredient";
import type { IngredientEvent } from "../types/event";
import type { CatalogEntry } from "../types/catalog";

/** File on disk, relative to the app's data directory. */
const STORE_FILE = "escoffe.json";

const KEYS = {
  ingredients: "ingredients",
  events: "events",
  catalog: "catalog",
} as const;

let storePromise: Promise<Store> | null = null;

/** Lazily open (and cache) the underlying store handle. */
function getStore(): Promise<Store> {
  // autoSave persists writes to disk shortly after each set/delete.
  return (storePromise ??= load(STORE_FILE, { defaults: {}, autoSave: true }));
}

async function read<T>(key: string): Promise<T[]> {
  const store = await getStore();
  const data = await store.get<T[]>(key);
  return Array.isArray(data) ? data : [];
}

async function write<T>(key: string, value: T[]): Promise<void> {
  const store = await getStore();
  await store.set(key, value);
  await store.save();
}

// --- Active ingredients ----------------------------------------------------

export const loadIngredients = () => read<Ingredient>(KEYS.ingredients);
export const saveIngredients = (items: Ingredient[]) =>
  write(KEYS.ingredients, items);

// --- History event log -----------------------------------------------------

export const loadEvents = () => read<IngredientEvent>(KEYS.events);
export const saveEvents = (events: IngredientEvent[]) =>
  write(KEYS.events, events);

// --- Name catalog ----------------------------------------------------------

export const loadCatalog = () => read<CatalogEntry>(KEYS.catalog);
export const saveCatalog = (catalog: CatalogEntry[]) =>
  write(KEYS.catalog, catalog);
