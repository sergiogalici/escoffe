/**
 * Persistence layer.
 *
 * The ONLY place that touches disk. Uses @tauri-apps/plugin-store to read and
 * write a single array of Ingredient under one key in one JSON file. The rest
 * of the app never imports the plugin directly — swap this file to change the
 * backend.
 */
import { load, type Store } from "@tauri-apps/plugin-store";
import type { Ingredient } from "../types/ingredient";

/** File on disk, relative to the app's data directory. */
const STORE_FILE = "escoffe.json";
/** Single key holding the whole ingredient array. */
const INGREDIENTS_KEY = "ingredients";

let storePromise: Promise<Store> | null = null;

/** Lazily open (and cache) the underlying store handle. */
function getStore(): Promise<Store> {
  // autoSave persists writes to disk shortly after each set/delete.
  return (storePromise ??= load(STORE_FILE, { defaults: {}, autoSave: true }));
}

/** Read all ingredients. Returns an empty array on first run. */
export async function loadIngredients(): Promise<Ingredient[]> {
  const store = await getStore();
  const data = await store.get<Ingredient[]>(INGREDIENTS_KEY);
  return Array.isArray(data) ? data : [];
}

/** Overwrite the persisted ingredient array. */
export async function saveIngredients(items: Ingredient[]): Promise<void> {
  const store = await getStore();
  await store.set(INGREDIENTS_KEY, items);
  await store.save();
}
