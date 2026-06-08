<script lang="ts">
  import { statistics, ingredientCatalog } from "../lib/stores/pantry.svelte";
  import StatTile from "../components/StatTile.svelte";
  import type { PeriodBucket } from "../lib/stats/aggregate";

  const totals = $derived(statistics.totals);
  const wastePct = $derived(Math.round(totals.wasteRate * 100));

  // Per-ingredient rows: merge catalog (so unused names show too) with stats.
  const rows = $derived.by(() => {
    const byKey = new Map(statistics.perIngredient.map((s) => [s.key, s]));
    return ingredientCatalog.entries
      .map((c) => {
        const s = byKey.get(c.key);
        return {
          name: c.name,
          key: c.key,
          consumed: s?.consumed ?? 0,
          wasted: s?.wasted ?? 0,
          total: s?.total ?? 0,
        };
      })
      .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
  });

  // Active trend granularity.
  let granularity = $state<"month" | "year">("month");
  const buckets = $derived<PeriodBucket[]>(
    granularity === "month" ? statistics.byMonth : statistics.byYear,
  );
  const maxBucket = $derived(
    Math.max(1, ...buckets.map((b) => b.consumed + b.wasted)),
  );
  const showTrends = $derived(
    granularity === "month"
      ? statistics.hasMonthlyTrend
      : statistics.hasYearlyTrend,
  );
</script>

<div class="flex flex-col gap-8">
  <header>
    <p class="mb-1 font-mono text-[0.7rem] uppercase tracking-[0.3em] text-saffron">
      History
    </p>
    <h1 class="font-display text-4xl font-semibold tracking-tight text-ink">Stats</h1>
  </header>

  {#if statistics.eventCount === 0}
    <div class="rounded-xl2 border border-dashed border-ink/15 bg-parchment/30 px-6 py-16 text-center">
      <p class="font-display text-xl font-semibold text-ink">No history yet</p>
      <p class="mt-1 text-sm text-ink-soft">
        Mark ingredients as consumed or wasted in the Pantry and your statistics will build up here.
      </p>
    </div>
  {:else}
    <!-- Totals -->
    <dl class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatTile label="Consumed" value={totals.consumed} tone="fresh" />
      <StatTile label="Wasted" value={totals.wasted} tone="terracotta" />
      <StatTile label="Logged" value={totals.total} hint="total outcomes" />
      <StatTile label="Waste rate" value={`${wastePct}%`} tone={wastePct > 30 ? "terracotta" : "saffron"} />
    </dl>

    <!-- Trends -->
    <section class="rounded-xl2 border border-ink/[0.07] bg-parchment/40 p-5 shadow-card sm:p-6">
      <div class="mb-5 flex items-center justify-between">
        <h2 class="font-display text-xl font-semibold text-ink">Trend</h2>
        <div class="flex rounded-lg border border-ink/10 p-0.5 text-xs">
          {#each ["month", "year"] as g}
            <button
              class="rounded-md px-3 py-1 font-medium capitalize transition
                {granularity === g ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'}"
              onclick={() => (granularity = g as "month" | "year")}
            >
              {g}ly
            </button>
          {/each}
        </div>
      </div>

      {#if !showTrends}
        <p class="py-8 text-center text-sm text-ink-soft/70">
          Not enough data yet — keep logging to see {granularity}ly trends.
        </p>
      {:else}
        <div class="flex items-end gap-3 overflow-x-auto pb-2" style="height: 11rem">
          {#each buckets as b (b.key)}
            {@const total = b.consumed + b.wasted}
            <div class="flex min-w-[2.5rem] flex-1 flex-col items-center gap-2">
              <div class="flex w-full flex-1 flex-col justify-end">
                <div
                  class="flex flex-col overflow-hidden rounded-md"
                  style="height: {(total / maxBucket) * 100}%"
                  title="{b.label}: {b.consumed} consumed, {b.wasted} wasted"
                >
                  {#if b.wasted > 0}
                    <div class="bg-terracotta" style="flex: {b.wasted}"></div>
                  {/if}
                  {#if b.consumed > 0}
                    <div class="bg-fresh" style="flex: {b.consumed}"></div>
                  {/if}
                </div>
              </div>
              <span class="whitespace-nowrap font-mono text-[0.6rem] text-ink-soft/60">{b.label}</span>
            </div>
          {/each}
        </div>
        <div class="mt-3 flex gap-4 text-xs text-ink-soft">
          <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-sm bg-fresh"></span>Consumed</span>
          <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-sm bg-terracotta"></span>Wasted</span>
        </div>
      {/if}
    </section>

    <!-- Per-ingredient -->
    <section class="rounded-xl2 border border-ink/[0.07] bg-parchment/40 p-5 shadow-card sm:p-6">
      <h2 class="mb-4 font-display text-xl font-semibold text-ink">By ingredient</h2>
      <ul class="divide-y divide-ink/[0.06]">
        {#each rows as row (row.key)}
          {@const wr = row.total > 0 ? row.wasted / row.total : 0}
          <li class="flex items-center gap-4 py-3">
            <span class="flex-1 truncate font-medium text-ink">{row.name}</span>

            <!-- consumed / wasted split bar -->
            <div class="hidden h-2 w-32 overflow-hidden rounded-full bg-ink/[0.06] sm:flex">
              <div class="bg-fresh" style="width: {(1 - wr) * 100}%"></div>
              <div class="bg-terracotta" style="width: {wr * 100}%"></div>
            </div>

            <span class="w-10 text-right font-mono text-xs text-fresh">{row.consumed}</span>
            <span class="w-10 text-right font-mono text-xs text-terracotta">{row.wasted}</span>
          </li>
        {/each}
      </ul>
      <div class="mt-3 flex justify-end gap-4 font-mono text-[0.65rem] uppercase tracking-wide text-ink-soft/50">
        <span class="w-10 text-right">cons.</span>
        <span class="w-10 text-right">wast.</span>
      </div>
    </section>
  {/if}
</div>
