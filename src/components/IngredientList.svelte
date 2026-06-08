<script lang="ts">
  import type { Ingredient } from "../lib/types/ingredient";
  import IngredientCard from "./IngredientCard.svelte";
  import EmptyState from "./EmptyState.svelte";

  interface Props {
    items: Ingredient[];
    onEdit: (ingredient: Ingredient) => void;
    onRemove: (id: string) => void;
  }

  let { items, onEdit, onRemove }: Props = $props();
</script>

{#if items.length === 0}
  <EmptyState />
{:else}
  <div class="grid gap-3 sm:grid-cols-2">
    {#each items as ingredient, index (ingredient.id)}
      <IngredientCard {ingredient} {index} {onEdit} {onRemove} />
    {/each}
  </div>
{/if}
