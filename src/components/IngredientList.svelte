<script lang="ts">
  import type { Ingredient } from "../lib/types/ingredient";
  import type { IngredientOutcome } from "../lib/types/event";
  import IngredientCard from "./IngredientCard.svelte";
  import EmptyState from "./EmptyState.svelte";

  interface Props {
    items: Ingredient[];
    onMark: (ingredient: Ingredient, outcome: IngredientOutcome) => void;
    onEdit: (ingredient: Ingredient) => void;
    onRemove: (ingredient: Ingredient) => void;
  }

  let { items, onMark, onEdit, onRemove }: Props = $props();
</script>

{#if items.length === 0}
  <EmptyState />
{:else}
  <div class="grid gap-3 sm:grid-cols-2">
    {#each items as ingredient, index (ingredient.id)}
      <IngredientCard {ingredient} {index} {onMark} {onEdit} {onRemove} />
    {/each}
  </div>
{/if}
