<script lang="ts">
  import { pantry } from "./lib/stores/pantry.svelte";
  import DrawerNav, { type Tab } from "./components/DrawerNav.svelte";
  import DashboardView from "./views/DashboardView.svelte";
  import PantryView from "./views/PantryView.svelte";
  import StatsView from "./views/StatsView.svelte";

  let activeTab = $state<Tab>("dashboard");
  let mobileOpen = $state(false);

  // Load persisted data once on mount.
  $effect(() => {
    pantry.init();
  });

  function navigate(tab: Tab) {
    activeTab = tab;
    mobileOpen = false;
  }
</script>

<div class="flex min-h-screen">
  <!-- Desktop sidebar -->
  <aside class="sticky top-0 hidden h-screen lg:block">
    <DrawerNav
      active={activeTab}
      onNavigate={navigate}
      pantryCount={pantry.count}
      atRiskCount={pantry.atRisk.length}
    />
  </aside>

  <!-- Mobile drawer -->
  {#if mobileOpen}
    <div class="fixed inset-0 z-40 lg:hidden">
      <button
        class="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        aria-label="Close menu"
        onclick={() => (mobileOpen = false)}
      ></button>
      <div class="animate-rise relative h-full bg-paper shadow-lift">
        <DrawerNav
          active={activeTab}
          onNavigate={navigate}
          pantryCount={pantry.count}
          atRiskCount={pantry.atRisk.length}
        />
      </div>
    </div>
  {/if}

  <!-- Main -->
  <main class="flex-1 overflow-x-hidden">
    <!-- Mobile top bar -->
    <div class="flex items-center gap-3 border-b border-ink/10 px-4 py-3 lg:hidden">
      <button
        class="rounded-lg p-2 text-ink-soft hover:bg-ink/5 hover:text-ink"
        aria-label="Open menu"
        onclick={() => (mobileOpen = true)}
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <span class="font-display text-lg font-semibold text-ink">Escoffe</span>
    </div>

    <div class="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
      {#if activeTab === "dashboard"}
        <DashboardView onNavigate={navigate} />
      {:else if activeTab === "pantry"}
        <PantryView />
      {:else}
        <StatsView />
      {/if}
    </div>
  </main>
</div>
