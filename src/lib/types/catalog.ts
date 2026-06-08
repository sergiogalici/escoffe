/**
 * Catalog of ingredient names the user has ever entered.
 *
 * Powers name autocomplete in the add form. Entries are deduplicated by a
 * normalized `key` only, so near-identical names stay distinct
 * (e.g. "chicken breast", "sliced chicken breast", "chicken thigh").
 */
export interface CatalogEntry {
  /** Display name, using the casing of the first time it was seen. */
  name: string;
  /** Normalized lookup key (lowercased, accent-stripped, space-collapsed). */
  key: string;
  /** ISO timestamp of first entry. */
  addedAt: string;
  /** How many times an ingredient with this name has been added to the pantry. */
  uses: number;
}
