<script lang="ts">
  import type { Ingredient } from "../lib/types/ingredient";
  import type { IngredientOutcome } from "../lib/types/event";
  import {
    getStatus,
    expirationLabel,
    formatDate,
    type ExpirationStatus,
  } from "../lib/calendar/expiration";

  interface Props {
    ingredient: Ingredient;
    index?: number;
    onMark: (ingredient: Ingredient, outcome: IngredientOutcome) => void;
    onEdit: (ingredient: Ingredient) => void;
    onRemove: (ingredient: Ingredient) => void;
  }

  let { ingredient, index = 0, onMark, onEdit, onRemove }: Props = $props();

  const status = $derived(getStatus(ingredient.expirationDate));

  const accent: Record<ExpirationStatus, string> = {
    expired: "bg-expired",
    critical: "bg-critical",
    soon: "bg-soon",
    fresh: "bg-fresh",
  };
  const pill: Record<ExpirationStatus, string> = {
    expired: "bg-expired/10 text-expired",
    critical: "bg-critical/10 text-critical",
    soon: "bg-soon/15 text-soon",
    fresh: "bg-fresh/15 text-fresh",
  };
</script>

<article
  class="group animate-rise relative flex items-stretch gap-4 overflow-hidden rounded-xl2 border border-ink/[0.07] bg-parchment/40 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift"
  style="animation-delay: {Math.min(index, 12) * 45}ms"
>
  <span class="w-1.5 shrink-0 {accent[status]}" aria-hidden="true"></span>

  <div class="flex flex-1 flex-col gap-2 py-4 pr-4">
    <div class="flex items-start justify-between gap-3">
      <h3 class="font-display text-xl font-semibold leading-tight text-ink">
        {ingredient.name}
      </h3>
      <span
        class="shrink-0 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wide {pill[status]}"
      >
        {expirationLabel(ingredient.expirationDate)}
      </span>
    </div>

    {#if ingredient.notes}
      <p class="text-sm leading-relaxed text-ink-soft/90">{ingredient.notes}</p>
    {/if}

    <div class="mt-auto flex items-center justify-between gap-3 pt-1">
      <time class="font-mono text-xs text-ink-soft/70" datetime={ingredient.expirationDate}>
        {formatDate(ingredient.expirationDate)}
      </time>

      <div class="flex items-center gap-1.5">
        <button
          class="rounded-lg bg-fresh/10 px-2.5 py-1 text-xs font-medium text-fresh transition hover:bg-fresh hover:text-paper"
          onclick={() => onMark(ingredient, "consumed")}
        >
          Consumed
        </button>
        <button
          class="rounded-lg bg-terracotta/10 px-2.5 py-1 text-xs font-medium text-terracotta transition hover:bg-terracotta hover:text-paper"
          onclick={() => onMark(ingredient, "wasted")}
        >
          Wasted
        </button>

        <span class="mx-0.5 h-4 w-px bg-ink/10"></span>

        <button
          class="rounded-lg px-2 py-1 text-xs text-ink-soft transition hover:bg-ink/5 hover:text-ink"
          onclick={() => onEdit(ingredient)}
          aria-label="Edit"
        >
          Edit
        </button>
        <button
          class="rounded-lg px-2 py-1 text-xs text-ink-soft transition hover:bg-expired/10 hover:text-expired"
          onclick={() => onRemove(ingredient)}
          aria-label="Remove"
        >
          Remove
        </button>
      </div>
    </div>
  </div>
</article>
