<script lang="ts">
  export type Tab = "dashboard" | "pantry" | "stats";

  interface Props {
    active: Tab;
    onNavigate: (tab: Tab) => void;
    pantryCount: number;
    atRiskCount: number;
  }

  let { active, onNavigate, pantryCount, atRiskCount }: Props = $props();

  const tabs: { id: Tab; label: string; icon: string }[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z",
    },
    {
      id: "pantry",
      label: "Pantry",
      icon: "M5 3h14a1 1 0 0 1 1 1v3H4V4a1 1 0 0 1 1-1Zm-1 6h16v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9Zm6 3v4m4-4v4",
    },
    {
      id: "stats",
      label: "Stats",
      icon: "M5 21V10m7 11V3m7 18v-7",
    },
  ];
</script>

<nav
  class="flex h-full w-60 shrink-0 flex-col border-r border-ink/10 bg-parchment/30 px-4 py-7"
>
  <!-- Brand -->
  <div class="mb-8 flex items-center gap-3 px-2">
    <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-paper">
      <svg class="h-5 w-5" viewBox="0 0 64 64" fill="none" stroke="#e0901f" stroke-width="3.5">
        <path d="M32 13c-7 0-12 4-12 11 0 4 2 7 6 9-3 2-5 5-5 9 0 6 5 10 11 10s11-4 11-10c0-4-2-7-5-9 4-2 6-5 6-9 0-7-5-11-12-11Z" />
      </svg>
    </span>
    <div>
      <p class="font-display text-lg font-semibold leading-none text-ink">Escoffe</p>
      <p class="mt-0.5 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ink-soft/60">
        Pantry
      </p>
    </div>
  </div>

  <!-- Tabs -->
  <ul class="flex flex-col gap-1">
    {#each tabs as tab (tab.id)}
      <li>
        <button
          class="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition
            {active === tab.id
              ? 'bg-ink text-paper shadow-card'
              : 'text-ink-soft hover:bg-ink/5 hover:text-ink'}"
          onclick={() => onNavigate(tab.id)}
          aria-current={active === tab.id ? "page" : undefined}
        >
          <svg
            class="h-[1.15rem] w-[1.15rem] shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d={tab.icon} />
          </svg>
          <span class="flex-1 text-left">{tab.label}</span>

          {#if tab.id === "pantry" && pantryCount > 0}
            <span
              class="rounded-full px-1.5 py-0.5 font-mono text-[0.6rem]
                {active === tab.id ? 'bg-paper/20 text-paper' : 'bg-ink/8 text-ink-soft'}"
            >
              {pantryCount}
            </span>
          {/if}
        </button>
      </li>
    {/each}
  </ul>

  <!-- At-risk hint -->
  {#if atRiskCount > 0}
    <div class="mt-4 rounded-xl border border-terracotta/20 bg-terracotta/5 px-3 py-2.5">
      <p class="text-xs font-medium text-terracotta">
        {atRiskCount} item{atRiskCount > 1 ? "s" : ""} need{atRiskCount > 1 ? "" : "s"} attention
      </p>
    </div>
  {/if}

  <footer class="mt-auto px-2 pt-6 font-mono text-[0.6rem] leading-relaxed text-ink-soft/50">
    Local-first · open source<br />Your data stays on this device.
  </footer>
</nav>
