<script lang="ts">
  import type { Ingredient, IngredientDraft } from "../lib/types/ingredient";

  interface Props {
    /** When set, the form edits this ingredient instead of creating one. */
    editing?: Ingredient | null;
    onSubmit: (draft: IngredientDraft) => void;
    onCancel?: () => void;
  }

  let { editing = null, onSubmit, onCancel }: Props = $props();

  // Local form state, seeded from the ingredient being edited.
  let name = $state("");
  let quantity = $state("");
  let expirationDate = $state("");
  let notes = $state("");

  // Re-seed fields whenever the editing target changes.
  $effect(() => {
    name = editing?.name ?? "";
    quantity = editing?.quantity ?? "";
    expirationDate = editing?.expirationDate ?? "";
    notes = editing?.notes ?? "";
  });

  const valid = $derived(name.trim().length > 0 && expirationDate !== "");

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (!valid) return;
    onSubmit({
      name: name.trim(),
      quantity: quantity.trim() || undefined,
      expirationDate,
      notes: notes.trim() || undefined,
    });
    if (!editing) reset();
  }

  function reset() {
    name = "";
    quantity = "";
    expirationDate = "";
    notes = "";
  }
</script>

<form
  onsubmit={handleSubmit}
  class="rounded-xl2 border border-ink/[0.07] bg-parchment/50 p-5 shadow-card sm:p-6"
>
  <div class="mb-4 flex items-baseline justify-between">
    <h2 class="font-display text-lg font-semibold text-ink">
      {editing ? "Edit ingredient" : "Add to pantry"}
    </h2>
    {#if editing && onCancel}
      <button type="button" class="text-xs text-ink-soft hover:text-ink" onclick={onCancel}>
        Cancel
      </button>
    {/if}
  </div>

  <div class="grid gap-4 sm:grid-cols-2">
    <div class="sm:col-span-2">
      <label class="label" for="name">Name</label>
      <input
        id="name"
        class="field font-display text-lg"
        placeholder="Olive oil"
        bind:value={name}
        autocomplete="off"
        required
      />
    </div>

    <div>
      <label class="label" for="quantity">Quantity</label>
      <input
        id="quantity"
        class="field"
        placeholder="500 ml"
        bind:value={quantity}
        autocomplete="off"
      />
    </div>

    <div>
      <label class="label" for="expiration">Expiration date</label>
      <input id="expiration" type="date" class="field" bind:value={expirationDate} required />
    </div>

    <div class="sm:col-span-2">
      <label class="label" for="notes">Notes</label>
      <textarea
        id="notes"
        class="field min-h-[4rem] resize-y"
        placeholder="Cold pressed, opened jar in the fridge…"
        bind:value={notes}
      ></textarea>
    </div>
  </div>

  <div class="mt-5 flex items-center gap-3">
    <button type="submit" class="btn-primary" disabled={!valid}>
      {editing ? "Save changes" : "Add ingredient"}
    </button>
    {#if !editing}
      <button type="button" class="btn-ghost" onclick={reset}>Clear</button>
    {/if}
  </div>
</form>
