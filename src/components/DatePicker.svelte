<script lang="ts">
  // Custom calendar date picker — replaces the bare native <input type="date">.
  // Emits an ISO date string (YYYY-MM-DD).
  interface Props {
    value: string;
    onChange: (iso: string) => void;
    id?: string;
    placeholder?: string;
  }

  let { value, onChange, id, placeholder = "Pick a date" }: Props = $props();

  let open = $state(false);
  let root = $state<HTMLDivElement>();

  const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  function toISO(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  function fromISO(iso: string): Date | null {
    if (!iso) return null;
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1);
  }

  const selected = $derived(fromISO(value));
  const today = new Date();
  const todayISO = toISO(today);

  // The month currently shown in the grid. openPopover() syncs it to `value`
  // every time the calendar opens, so the initial seed is just today.
  let viewYear = $state(new Date().getFullYear());
  let viewMonth = $state(new Date().getMonth());

  // Re-sync the view to the selected value whenever the popover opens.
  function openPopover() {
    const base = fromISO(value) ?? new Date();
    viewYear = base.getFullYear();
    viewMonth = base.getMonth();
    open = true;
  }

  const grid = $derived.by(() => {
    const first = new Date(viewYear, viewMonth, 1);
    // Monday-based offset (getDay: 0=Sun … 6=Sat).
    const offset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  });

  const displayLabel = $derived(
    selected
      ? selected.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "",
  );

  function step(delta: number) {
    const m = viewMonth + delta;
    viewYear += Math.floor(m / 12);
    viewMonth = ((m % 12) + 12) % 12;
  }

  function pick(d: Date) {
    onChange(toISO(d));
    open = false;
  }

  $effect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (root && !root.contains(e.target as Node)) open = false;
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") open = false;
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  });
</script>

<div class="relative" bind:this={root}>
  <button
    {id}
    type="button"
    class="field flex items-center justify-between text-left"
    onclick={() => (open ? (open = false) : openPopover())}
    aria-haspopup="dialog"
    aria-expanded={open}
  >
    <span class={displayLabel ? "text-ink" : "text-ink-soft/50"}>
      {displayLabel || placeholder}
    </span>
    <svg
      class="h-4 w-4 shrink-0 text-ink-soft/70"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
    >
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
      <path d="M3 9h18M8 2.5v4M16 2.5v4" stroke-linecap="round" />
    </svg>
  </button>

  {#if open}
    <div
      class="animate-rise absolute left-0 z-30 mt-2 w-[19rem] rounded-xl2 border border-ink/10 bg-paper p-3 shadow-lift"
      role="dialog"
    >
      <div class="mb-2 flex items-center justify-between px-1">
        <button
          type="button"
          class="rounded-lg p-1.5 text-ink-soft transition hover:bg-ink/5 hover:text-ink"
          onclick={() => step(-1)}
          aria-label="Previous month"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <span class="font-display text-sm font-semibold text-ink">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          class="rounded-lg p-1.5 text-ink-soft transition hover:bg-ink/5 hover:text-ink"
          onclick={() => step(1)}
          aria-label="Next month"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>

      <div class="mb-1 grid grid-cols-7 gap-1">
        {#each WEEKDAYS as wd}
          <span class="py-1 text-center font-mono text-[0.65rem] uppercase text-ink-soft/60">{wd}</span>
        {/each}
      </div>

      <div class="grid grid-cols-7 gap-1">
        {#each grid as cell}
          {#if cell}
            {@const iso = toISO(cell)}
            {@const isSelected = iso === value}
            {@const isToday = iso === todayISO}
            <button
              type="button"
              class="aspect-square rounded-lg text-sm transition
                {isSelected
                  ? 'bg-ink font-semibold text-paper'
                  : isToday
                    ? 'bg-saffron/15 font-medium text-terracotta'
                    : 'text-ink-soft hover:bg-ink/5 hover:text-ink'}"
              onclick={() => pick(cell)}
            >
              {cell.getDate()}
            </button>
          {:else}
            <span></span>
          {/if}
        {/each}
      </div>

      <div class="mt-2 flex justify-between border-t border-ink/10 px-1 pt-2">
        <button type="button" class="text-xs text-ink-soft hover:text-ink" onclick={() => pick(new Date())}>
          Today
        </button>
        {#if value}
          <button type="button" class="text-xs text-ink-soft hover:text-expired" onclick={() => { onChange(""); open = false; }}>
            Clear
          </button>
        {/if}
      </div>
    </div>
  {/if}
</div>
