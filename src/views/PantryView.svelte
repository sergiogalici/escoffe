<script lang="ts">
  import { pantry } from "../lib/stores/pantry.svelte";
  import type { Ingredient, IngredientDraft } from "../lib/types/ingredient";
  import type { IngredientOutcome } from "../lib/types/event";
  import IngredientForm from "../components/IngredientForm.svelte";
  import IngredientList from "../components/IngredientList.svelte";
  import ConfirmDialog from "../components/ConfirmDialog.svelte";

  let editing = $state<Ingredient | null>(null);

  // Pending confirmation: either marking an outcome or removing an item.
  type Pending =
    | { kind: "mark"; ingredient: Ingredient; outcome: IngredientOutcome }
    | { kind: "remove"; ingredient: Ingredient }
    | null;
  let pending = $state<Pending>(null);

  function handleSubmit(draft: IngredientDraft) {
    if (editing) {
      pantry.update(editing.id, draft);
      editing = null;
    } else {
      pantry.add(draft);
    }
  }

  function handleEdit(ingredient: Ingredient) {
    editing = ingredient;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function requestMark(ingredient: Ingredient, outcome: IngredientOutcome) {
    pending = { kind: "mark", ingredient, outcome };
  }
  function requestRemove(ingredient: Ingredient) {
    pending = { kind: "remove", ingredient };
  }

  function confirmPending() {
    if (!pending) return;
    if (editing?.id === pending.ingredient.id) editing = null;
    if (pending.kind === "mark") {
      pantry.mark(pending.ingredient.id, pending.outcome);
    } else {
      pantry.remove(pending.ingredient.id);
    }
    pending = null;
  }

  // Dialog copy derived from the pending action.
  const dialog = $derived.by(() => {
    if (!pending) return null;
    const n = pending.ingredient.name;
    if (pending.kind === "remove") {
      return {
        title: "Remove ingredient?",
        message: `"${n}" will be deleted from your pantry. This is not counted as consumed or wasted.`,
        confirmLabel: "Remove",
        tone: "danger" as const,
      };
    }
    return pending.outcome === "consumed"
      ? {
          title: "Mark as consumed?",
          message: `"${n}" will move to your history as consumed and leave the pantry.`,
          confirmLabel: "Yes, consumed",
          tone: "consumed" as const,
        }
      : {
          title: "Mark as wasted?",
          message: `"${n}" will move to your history as wasted and leave the pantry.`,
          confirmLabel: "Yes, wasted",
          tone: "wasted" as const,
        };
  });
</script>

<div class="grid gap-8 lg:grid-cols-[22rem_1fr]">
  <section class="lg:sticky lg:top-8 lg:self-start">
    <IngredientForm {editing} onSubmit={handleSubmit} onCancel={() => (editing = null)} />
  </section>

  <section>
    <div class="mb-4 flex items-baseline justify-between">
      <h2 class="font-display text-xl font-semibold text-ink">Pantry</h2>
      <span class="font-mono text-xs text-ink-soft/70">sorted by expiry</span>
    </div>

    {#if pantry.ready}
      <IngredientList
        items={pantry.items}
        onMark={requestMark}
        onEdit={handleEdit}
        onRemove={requestRemove}
      />
    {:else}
      <p class="py-12 text-center text-sm text-ink-soft/60">Loading pantry…</p>
    {/if}
  </section>
</div>

{#if dialog}
  <ConfirmDialog
    open={pending !== null}
    title={dialog.title}
    message={dialog.message}
    confirmLabel={dialog.confirmLabel}
    tone={dialog.tone}
    onConfirm={confirmPending}
    onCancel={() => (pending = null)}
  />
{/if}
