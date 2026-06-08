<script lang="ts">
  // Generic confirmation dialog rendered as a centered modal.
  type Tone = "default" | "consumed" | "wasted" | "danger";

  interface Props {
    open: boolean;
    title: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: Tone;
    onConfirm: () => void;
    onCancel: () => void;
  }

  let {
    open,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    tone = "default",
    onConfirm,
    onCancel,
  }: Props = $props();

  const confirmClass: Record<Tone, string> = {
    default: "bg-ink text-paper hover:bg-terracotta",
    consumed: "bg-fresh text-paper hover:brightness-110",
    wasted: "bg-terracotta text-paper hover:brightness-110",
    danger: "bg-expired text-paper hover:brightness-110",
  };

  $effect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });
</script>

{#if open}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
    style="animation: rise 0.2s ease both"
  >
    <button
      class="absolute inset-0 cursor-default"
      aria-label="Close dialog"
      onclick={onCancel}
    ></button>

    <div
      class="animate-rise relative w-full max-w-sm rounded-xl2 border border-ink/10 bg-paper p-6 shadow-lift"
      role="dialog"
      aria-modal="true"
    >
      <h3 class="font-display text-xl font-semibold text-ink">{title}</h3>
      {#if message}
        <p class="mt-2 text-sm leading-relaxed text-ink-soft">{message}</p>
      {/if}

      <div class="mt-6 flex justify-end gap-3">
        <button type="button" class="btn-ghost" onclick={onCancel}>
          {cancelLabel}
        </button>
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-xl px-5 py-2.5 font-medium transition active:scale-[0.98] {confirmClass[tone]}"
          onclick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
{/if}
