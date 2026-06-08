# CLAUDE.md — Escoffe

Source of truth for anyone (human or agent) working on Escoffe.
**This file is maintained by the agents themselves: whenever you change the
architecture, stack, conventions, or core entity, update this file in the same
change.**

## What Escoffe is

A local-first desktop app to track pantry ingredients and their expiration
dates. No backend, no account, no network. All data stays on the user's device.

## Stack (do not substitute)

- **Tauri 2** — desktop shell.
- **Svelte 5 with the runes API** (`$state`, `$derived`, `$effect`, `$props`).
  Do NOT use the legacy Svelte 3/4 store/reactive-statement style.
- **TypeScript** — strict mode.
- **Tailwind CSS v3** (not v4 — chosen for maturity/stability).
- **@tauri-apps/plugin-store** — the only persistence mechanism.
- **@tauri-apps/plugin-notification** — expiration alerts.

## Language rule

Everything — code, identifiers, comments, UI strings, docs, commit messages —
is written in **English**. No exceptions.

## Core entity + history model

The pantry is built from one core entity plus an append-only history log and a
name catalog. All three persist as plain arrays via plugin-store (keys
`ingredients`, `events`, `catalog`) in one file (`escoffe.json`).

```ts
// The active pantry item (core entity)
interface Ingredient {
  id: string;
  name: string;
  expirationDate: string; // ISO date YYYY-MM-DD
  notes?: string;         // free-form: quantity, recipe ideas, anything
  addedAt: string;        // ISO timestamp
}

// History log entry — appended when an item is consumed/wasted, item removed
interface IngredientEvent {
  id: string;
  name: string;
  key: string;            // normalized name (links to catalog + stats grouping)
  outcome: "consumed" | "wasted";
  loggedAt: string;       // ISO timestamp
  addedAt: string;        // for future shelf-life stats
  expirationDate: string;
}

// Catalog of every name ever entered — powers fuzzy autocomplete
interface CatalogEntry {
  name: string;
  key: string;            // normalized; dedupe by this ONLY (near-names stay distinct)
  addedAt: string;
  uses: number;
}
```

The event log is append-only and timestamped so new statistics (trends,
shelf-life, seasonality) are pure derivations — no schema change needed.

## Architecture

```
src/
  components/      Presentational Svelte components (no disk I/O)
    DrawerNav · DatePicker · ConfirmDialog · IngredientForm ·
    IngredientList · IngredientCard · EmptyState · StatTile
  views/           One component per nav tab
    DashboardView · PantryView · StatsView
  lib/
    types/         ingredient.ts · event.ts · catalog.ts
    stores/        pantry.svelte.ts — runes store, single source of truth
    persistence/   store.ts (plugin-store), notify.ts (plugin-notification)
    calendar/      expiration.ts — pure date math
    stats/         aggregate.ts — pure stats derived from the event log
    utils/         fuzzy.ts — accent/case-insensitive fuzzy matcher
  App.svelte       Root: nav drawer + tab switching + store init
  main.ts          mount() entry
  app.css          Tailwind layers + component classes
src-tauri/         Rust: registers store + notification plugins, window config
```

UI is a 3-tab navigation drawer: **Dashboard** (summary + at-risk),
**Pantry** (add form + ingredient list), **Stats** (totals + month/year trends
+ per-ingredient breakdown).

### Layer rules (keep these boundaries)

1. **Only `lib/persistence/store.ts` imports `@tauri-apps/plugin-store`.**
   Swapping persistence = editing one file.
2. **Only `lib/persistence/notify.ts` imports `@tauri-apps/plugin-notification`.**
3. **`lib/stores/pantry.svelte.ts` is the single source of truth.** Components
   mutate state only through its API (`add`, `update`, `remove`, `mark`,
   `init`, `suggest`). They never touch persistence directly.
4. **`lib/calendar/expiration.ts`, `lib/stats/aggregate.ts`, `lib/utils/fuzzy.ts`
   stay pure** — no I/O, no Svelte, no store imports. Easy to unit test.
5. **Components/views are presentational** and receive data + callbacks via
   `$props()`. Marking consumed/wasted and removing always go through a
   `ConfirmDialog`.

## Conventions

- New IDs: `crypto.randomUUID()` (generated inside the store, never in the UI).
- Dates: `expirationDate` is ISO `YYYY-MM-DD`; timestamps (`addedAt`,
  `loggedAt`) are full ISO strings. Never store `Date` objects.
- Name dedupe/grouping uses `normalize()` from `utils/fuzzy.ts` (lowercased,
  accent-stripped, space-collapsed). Catalog/stats key off this; display keeps
  original casing. Similar-but-different names must stay distinct.
- Tailwind design tokens (colors, fonts) live in `tailwind.config.js`. Reuse the
  `paper`/`ink`/`saffron`/`terracotta` palette and the expiration status colors
  (`expired`/`critical`/`soon`/`fresh`) rather than hardcoding hex values.
- Reusable element styles (`.field`, `.btn-primary`, `.label`) live in
  `app.css` under `@layer components`.
- Keep it simple and readable. Prefer clarity over cleverness.

## Tauri specifics

- Permissions live in `src-tauri/capabilities/default.json`
  (`core:default`, `store:default`, `notification:default`). Add a permission
  there if you call a new plugin command.
- Plugins are registered in `src-tauri/src/lib.rs`.
- Window label is `main` (default) — referenced by the capability file.

## Scripts

- `npm run dev` — Vite only (UI iteration; plugins inert without Tauri runtime).
- `npm run tauri:dev` — full app with hot reload.
- `npm run tauri:build` — production desktop binary.
- `npm run check` — `svelte-check` type checking.
- `npm run icons` — generate `src-tauri/icons/` from `public/escoffe.svg`. One
  run emits `.ico` + `.icns` + PNGs for all platforms.

## Build environment note

This dev environment may lack Rust/webkit, so `tauri:dev`/`tauri:build` can fail
locally even when the frontend is correct. `npm run dev` and `npm run check`
still validate the frontend.
