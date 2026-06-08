<script lang="ts">
  import type { Ingredient, IngredientDraft } from "../lib/types/ingredient";
  import { pantry } from "../lib/stores/pantry.svelte";
  import DatePicker from "./DatePicker.svelte";

  interface Props {
    editing?: Ingredient | null;
    onSubmit: (draft: IngredientDraft) => void;
    onCancel?: () => void;
  }

  let { editing = null, onSubmit, onCancel }: Props = $props();

  let name = $state("");
  let expirationDate = $state("");
  let notes = $state("");

  // Autocomplete state.
  let showSuggestions = $state(false);
  let activeIndex = $state(-1);

  $effect(() => {
    name = editing?.name ?? "";
    expirationDate = editing?.expirationDate ?? "";
    notes = editing?.notes ?? "";
  });

  // Suggestions from the catalog; never forces a choice, just offers shortcuts.
  const suggestions = $derived(
    showSuggestions && name.trim().length > 0 ? pantry.suggest(name, 6) : [],
  );

  const valid = $derived(name.trim().length > 0 && expirationDate !== "");

  function choose(value: string) {
    name = value;
    showSuggestions = false;
    activeIndex = -1;
  }

  function onNameKeydown(e: KeyboardEvent) {
    if (suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = (activeIndex + 1) % suggestions.length;
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = (activeIndex - 1 + suggestions.length) % suggestions.length;
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      choose(suggestions[activeIndex].name);
    } else if (e.key === "Escape") {
      showSuggestions = false;
    }
  }

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (!valid) return;
    onSubmit({
      name: name.trim(),
      expirationDate,
      notes: notes.trim() || undefined,
    });
    if (!editing) reset();
  }

  function reset() {
    name = "";
    expirationDate = "";
    notes = "";
    showSuggestions = false;
    activeIndex = -1;
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

  <div class="grid gap-4">
    <!-- Name with fuzzy autocomplete -->
    <div class="relative">
      <label class="label" for="name">Name</label>
      <input
        id="name"
        class="field font-display text-lg"
        placeholder="Chicken breast"
        bind:value={name}
        oninput={() => {
          showSuggestions = true;
          activeIndex = -1;
        }}
        onfocus={() => (showSuggestions = true)}
        onblur={() => setTimeout(() => (showSuggestions = false), 120)}
        onkeydown={onNameKeydown}
        autocomplete="off"
        required
      />

      {#if suggestions.length > 0}
        <ul
          class="animate-rise absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-ink/10 bg-paper shadow-lift"
          role="listbox"
        >
          {#each suggestions as s, i (s.key)}
            <li>
              <button
                type="button"
                class="flex w-full items-center justify-between px-4 py-2 text-left text-sm transition
                  {i === activeIndex ? 'bg-saffron/10 text-ink' : 'text-ink-soft hover:bg-ink/5'}"
                onmousedown={() => choose(s.name)}
              >
                <span>{s.name}</span>
                <span class="font-mono text-[0.65rem] text-ink-soft/50">
                  {s.uses}×
                </span>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>

    <div>
      <label class="label" for="expiration">Expiration date</label>
      <DatePicker
        id="expiration"
        value={expirationDate}
        onChange={(iso) => (expirationDate = iso)}
      />
    </div>

    <div>
      <label class="label" for="notes">Notes</label>
      <textarea
        id="notes"
        class="field min-h-[4.5rem] resize-y"
        placeholder="500 g · or a recipe idea: roast with rosemary…"
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
