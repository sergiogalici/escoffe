<script lang="ts">
  interface Props {
    label: string;
    value: string | number;
    tone?: "ink" | "fresh" | "terracotta" | "saffron";
    hint?: string;
  }

  let { label, value, tone = "ink", hint }: Props = $props();

  const valueColor = $derived(
    {
      ink: "text-ink",
      fresh: "text-fresh",
      terracotta: "text-terracotta",
      saffron: "text-saffron",
    }[tone],
  );
</script>

<div class="rounded-xl2 border border-ink/[0.07] bg-parchment/40 p-5 shadow-card">
  <dt class="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ink-soft/70">
    {label}
  </dt>
  <dd class="mt-1 font-display text-4xl font-semibold {valueColor}">{value}</dd>
  {#if hint}
    <p class="mt-1 text-xs text-ink-soft/70">{hint}</p>
  {/if}
</div>
