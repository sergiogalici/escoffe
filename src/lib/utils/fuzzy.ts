/**
 * Tiny dependency-free fuzzy matcher, tuned for short ingredient names.
 *
 * Accent-insensitive and case-insensitive so Italian names match cleanly
 * ("pero" ~ "però"). Pure functions — no framework, easy to test.
 */

/** Normalize for comparison: strip accents, lowercase, collapse whitespace. */
export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * Score how well `query` matches `target`. Higher is better; 0 means no match.
 * Ranking: exact > prefix > substring > subsequence (gap-penalized).
 */
export function fuzzyScore(query: string, target: string): number {
  const q = normalize(query);
  const t = normalize(target);
  if (!q) return 0;
  if (t === q) return 1000;
  if (t.startsWith(q)) return 800 - (t.length - q.length);

  const at = t.indexOf(q);
  if (at >= 0) return 600 - at - (t.length - q.length);

  // Subsequence: every query char appears in order, penalize gaps.
  let cursor = 0;
  let gaps = 0;
  let last = -1;
  for (const ch of q) {
    const found = t.indexOf(ch, cursor);
    if (found === -1) return 0;
    if (last >= 0) gaps += found - last - 1;
    last = found;
    cursor = found + 1;
  }
  return Math.max(1, 300 - gaps - (t.length - q.length));
}

export interface FuzzyMatch<T> {
  item: T;
  score: number;
}

/**
 * Rank `items` against `query`, returning the best matches first.
 * Returns at most `limit` results, dropping non-matches.
 */
export function fuzzySearch<T>(
  query: string,
  items: T[],
  getText: (item: T) => string,
  limit = 6,
): T[] {
  if (!normalize(query)) return [];
  return items
    .map((item) => ({ item, score: fuzzyScore(query, getText(item)) }))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((m) => m.item);
}
