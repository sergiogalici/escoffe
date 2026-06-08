# Escoffe

> A local-first desktop app to track your pantry and never let an ingredient expire unnoticed.

Escoffe is a small, open-source desktop application that keeps a list of the
ingredients in your kitchen and watches their expiration dates. Everything lives
on your device — no account, no cloud, no tracking.

Built with **Tauri 2**, **Svelte 5** (runes API), **TypeScript**, and **Tailwind CSS v3**.

---

## Features

- **Add, edit and remove ingredients** — name, expiration date, and free-form notes (use them for quantity or recipe ideas).
- **Smart name autocomplete** — every name you enter is remembered; typing offers accent- and case-insensitive fuzzy suggestions. Pick one or type a brand-new near-identical name — they stay distinct.
- **Custom calendar date picker** — a polished popover, not the bare native input.
- **Consumed vs wasted tracking** — mark each item from the pantry (with a confirmation step); it moves to a timestamped history log.
- **Statistics** — a dedicated tab with overall totals, waste rate, monthly/yearly trends (once there's enough data), and a per-ingredient breakdown.
- **Three-tab navigation drawer** — Dashboard (overview + what needs attention), Pantry (manage items), Stats.
- **Expiration awareness** — items are color-coded and sorted by how soon they expire (fresh → soon → critical → expired).
- **Desktop notifications** — get alerted on launch about ingredients that are expired or expiring soon.
- **Local-first persistence** — data is stored on disk via `@tauri-apps/plugin-store` as a single JSON file. No network required.

## Tech stack

| Layer        | Choice                                  |
| ------------ | --------------------------------------- |
| Shell        | Tauri 2                                 |
| UI framework | Svelte 5 (runes API)                    |
| Language     | TypeScript                              |
| Styling      | Tailwind CSS v3                         |
| Persistence  | `@tauri-apps/plugin-store`              |
| Notifications| `@tauri-apps/plugin-notification`       |

## Project structure

```
src/
  components/            Reusable UI components
    DrawerNav.svelte       3-tab navigation drawer
    DatePicker.svelte      Custom calendar popover
    ConfirmDialog.svelte   Confirmation modal
    IngredientForm.svelte  Add/edit + fuzzy name autocomplete
    IngredientList.svelte
    IngredientCard.svelte
    EmptyState.svelte
    StatTile.svelte
  views/                 One component per nav tab
    DashboardView.svelte
    PantryView.svelte
    StatsView.svelte
  lib/
    types/              ingredient.ts · event.ts · catalog.ts
    stores/             pantry.svelte.ts — Svelte 5 runes store (source of truth)
    persistence/        Disk I/O (plugin-store) + notifications
    calendar/           Pure expiration date math
    stats/              Pure statistics derived from the event log
    utils/              Fuzzy matcher
  App.svelte            Root: nav drawer + tab switching
  main.ts               App entry point
  app.css               Tailwind + base styles
src-tauri/              Rust backend (plugins, window)
```

### The core entity

The active pantry revolves around one type, persisted as a plain array:

```ts
interface Ingredient {
  id: string;
  name: string;
  expirationDate: string; // ISO date, YYYY-MM-DD
  notes?: string;         // free-form: quantity or recipe ideas
  addedAt: string;        // ISO timestamp
}
```

When an item is consumed or wasted it is removed from the pantry and appended to
a timestamped history log (`IngredientEvent[]`), which all statistics derive
from. A separate name catalog (`CatalogEntry[]`) powers autocomplete.
Persistence stores these three arrays under three keys in one JSON file.

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://www.rust-lang.org/tools/install) (stable) + the
  [Tauri 2 system dependencies](https://v2.tauri.app/start/prerequisites/) for your OS.

### Install

```bash
npm install
```

### Run in development

```bash
npm run tauri:dev
```

This builds the Vite frontend and launches the Tauri window with hot reload.

> Running only the web frontend (`npm run dev`) works for UI iteration, but the
> store and notification plugins require the Tauri runtime.

### Build a desktop binary

```bash
npm run tauri:build
```

> **Icons:** before the first `tauri:build`, generate the app icons (the
> `src-tauri/icons/` folder is not committed). One command produces every
> format — `.ico` (Windows), `.icns` (macOS) and the PNG set:
>
> ```bash
> npm run icons
> ```
>
> `tauri icon` emits all platform formats in a single run regardless of host OS.
> For best results swap the SVG source for a 1024×1024 PNG.

## Where is my data?

The store file `escoffe.json` lives in the app's data directory:

- **Linux**: `~/.local/share/com.escoffe.app/`
- **macOS**: `~/Library/Application Support/com.escoffe.app/`
- **Windows**: `%APPDATA%\com.escoffe.app\`

## Contributing

Contributions are welcome. Please keep the codebase simple and readable, and
keep all code, comments, UI text, and documentation **in English**. See
[`CLAUDE.md`](./CLAUDE.md) for the architecture contract and conventions.

## License

[MIT](./LICENSE)
# escoffe
