# Escoffe

> A local-first desktop app to track your pantry and never let an ingredient expire unnoticed.

Escoffe is a small, open-source desktop application that keeps a list of the
ingredients in your kitchen and watches their expiration dates. Everything lives
on your device — no account, no cloud, no tracking.

Built with **Tauri 2**, **Svelte 5** (runes API), **TypeScript**, and **Tailwind CSS v3**.

---

## Features

- **Add, edit and remove ingredients** — name, quantity, expiration date, notes.
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
  components/            Svelte UI components
    IngredientForm.svelte
    IngredientList.svelte
    IngredientCard.svelte
    EmptyState.svelte
  lib/
    types/              TypeScript types (Ingredient)
    stores/             Svelte 5 runes store (single source of truth)
    persistence/        Disk I/O (plugin-store) + notifications
    calendar/           Pure expiration date math
  App.svelte            Root component
  main.ts               App entry point
  app.css               Tailwind + base styles
src-tauri/              Rust backend (plugins, window)
```

### The core entity

The whole app revolves around one type:

```ts
interface Ingredient {
  id: string;
  name: string;
  quantity?: string;
  expirationDate: string; // ISO date, YYYY-MM-DD
  notes?: string;
}
```

Persistence stores a plain `Ingredient[]` under a single key.

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
