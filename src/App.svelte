<script lang="ts">
  import { ingredients } from "./lib/stores/ingredients.svelte";
  import type { Ingredient, IngredientDraft } from "./lib/types/ingredient";
  import IngredientForm from "./components/IngredientForm.svelte";
  import IngredientList from "./components/IngredientList.svelte";

  let editing = $state<Ingredient | null>(null);

  // Load persisted data once the component mounts.
  $effect(() => {
    ingredients.init();
  });

  const atRiskCount = $derived(ingredients.atRisk.length);

  function handleSubmit(draft: IngredientDraft) {
    if (editing) {
      ingredients.update(editing.id, draft);
      editing = null;
    } else {
      ingredients.add(draft);
    }
  }

  function handleEdit(ingredient: Ingredient) {
    editing = ingredient;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleRemove(id: string) {
    if (editing?.id === id) editing = null;
    ingredients.remove(id);
  }
</script>

<div class="mx-auto min-h-screen w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
  <!-- Masthead -->
  <header class="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-ink/10 pb-6">
    <div>
      <p class="mb-1 font-mono text-[0.7rem] uppercase tracking-[0.3em] text-saffron">
        Local-first pantry
      </p>
      <h1 class="font-display text-5xl font-semibold tracking-tight text-ink sm:text-6xl">
        Escoffe
      </h1>
      <p class="mt-2 max-w-md text-sm text-ink-soft">
        Track what's in your kitchen and never let an ingredient expire unnoticed.
      </p>
    </div>

    <!-- Live stats -->
    <dl class="flex gap-6">
      <div class="text-right">
        <dt class="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ink-soft/70">
          Tracked
        </dt>
        <dd class="font-display text-3xl font-semibold text-ink">{ingredients.count}</dd>
      </div>
      <div class="text-right">
        <dt class="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ink-soft/70">
          At risk
        </dt>
        <dd
          class="font-display text-3xl font-semibold {atRiskCount > 0
            ? 'text-terracotta'
            : 'text-fresh'}"
        >
          {atRiskCount}
        </dd>
      </div>
    </dl>
  </header>

  <div class="grid gap-8 lg:grid-cols-[22rem_1fr]">
    <!-- Form column -->
    <section class="lg:sticky lg:top-10 lg:self-start">
      <IngredientForm {editing} onSubmit={handleSubmit} onCancel={() => (editing = null)} />
    </section>

    <!-- List column -->
    <section>
      <div class="mb-4 flex items-baseline justify-between">
        <h2 class="font-display text-xl font-semibold text-ink">Pantry</h2>
        <span class="font-mono text-xs text-ink-soft/70">sorted by expiry</span>
      </div>

      {#if ingredients.ready}
        <IngredientList items={ingredients.list} onEdit={handleEdit} onRemove={handleRemove} />
      {:else}
        <p class="py-12 text-center text-sm text-ink-soft/60">Loading pantry…</p>
      {/if}
    </section>
  </div>

  <footer class="mt-16 border-t border-ink/10 pt-5 text-center font-mono text-[0.7rem] text-ink-soft/60">
    Escoffe · open source · your data stays on this device
  </footer>
</div>
