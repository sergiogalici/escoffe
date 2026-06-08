<script lang="ts">
  import { pantry, statistics } from "../lib/stores/pantry.svelte";
  import type { Tab } from "../components/DrawerNav.svelte";
  import StatTile from "../components/StatTile.svelte";
  import {
    expirationLabel,
    formatDate,
    getStatus,
    type ExpirationStatus,
  } from "../lib/calendar/expiration";

  interface Props {
    onNavigate: (tab: Tab) => void;
  }
  let { onNavigate }: Props = $props();

  const totals = $derived(statistics.totals);
  const wastePct = $derived(Math.round(totals.wasteRate * 100));

  const dot: Record<ExpirationStatus, string> = {
    expired: "bg-expired",
    critical: "bg-critical",
    soon: "bg-soon",
    fresh: "bg-fresh",
  };
</script>

<div class="flex flex-col gap-8">
  <header>
    <p class="mb-1 font-mono text-[0.7rem] uppercase tracking-[0.3em] text-saffron">
      Overview
    </p>
    <h1 class="font-display text-4xl font-semibold tracking-tight text-ink">Dashboard</h1>
  </header>

  <!-- Summary tiles -->
  <dl class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <StatTile label="In pantry" value={pantry.count} hint="ingredients tracked" />
    <StatTile
      label="Expiring soon"
      value={pantry.atRisk.length}
      tone={pantry.atRisk.length > 0 ? "terracotta" : "fresh"}
      hint="within 7 days"
    />
    <StatTile label="Consumed" value={totals.consumed} tone="fresh" hint="all time" />
    <StatTile
      label="Waste rate"
      value={totals.total > 0 ? `${wastePct}%` : "—"}
      tone="terracotta"
      hint={`${totals.wasted} wasted of ${totals.total}`}
    />
  </dl>

  <!-- Needs attention -->
  <section class="rounded-xl2 border border-ink/[0.07] bg-parchment/40 p-5 shadow-card sm:p-6">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="font-display text-xl font-semibold text-ink">Needs attention</h2>
      <button
        class="text-xs font-medium text-terracotta hover:underline"
        onclick={() => onNavigate("pantry")}
      >
        Open pantry →
      </button>
    </div>

    {#if pantry.atRisk.length === 0}
      <p class="py-6 text-center text-sm text-ink-soft/70">
        Nothing expiring soon. Your pantry is in good shape. 🌿
      </p>
    {:else}
      <ul class="divide-y divide-ink/[0.06]">
        {#each pantry.atRisk.slice(0, 6) as item (item.id)}
          <li class="flex items-center gap-3 py-2.5">
            <span class="h-2 w-2 shrink-0 rounded-full {dot[getStatus(item.expirationDate)]}"></span>
            <span class="flex-1 truncate font-medium text-ink">{item.name}</span>
            <span class="font-mono text-[0.7rem] text-ink-soft/60">{formatDate(item.expirationDate)}</span>
            <span class="w-28 text-right text-xs font-medium text-terracotta">
              {expirationLabel(item.expirationDate)}
            </span>
          </li>
        {/each}
      </ul>
    {/if}
  </section>
</div>
