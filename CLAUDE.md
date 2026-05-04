# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About

**Cy's Grimoire** is a PWA companion tool for the mobile game Toram Online, covering character building, skill planning, item management, damage calculations, and quest tracking. Deployed at [grimoire.ygo.tw](https://grimoire.ygo.tw).

## Commands

Use **Yarn** (v4.10.3) as the package manager — do not use npm.

```bash
yarn dev          # Dev server on port 9039
yarn build        # Production build
yarn preview      # Preview production build
yarn lint         # ESLint with auto-fix
yarn type-check   # Vue TSC type checking
yarn pretty       # Format with Prettier
```

## Architecture

### Directory Layout

| Path | Purpose |
|---|---|
| `src/router/` | Vue Router v4 routes — each route has metadata driving title, menus, and meta tags |
| `src/stores/` | Pinia stores: `app/main`, `app/locale`, `app/datas`, `app/setting`, `app/breadcrumb` |
| `src/lib/` | Game-domain business logic — one sub-module per feature (Character, Skill, Items, Enchant, etc.) |
| `src/views/` | Page-level Vue components, grouped by feature |
| `src/components/` | Reusable UI components (app-layout, card, common, cyteria-branded) |
| `src/shared/` | Cross-cutting utilities: Device detection, Layout, ElementObserver, services |
| `src/locales/` | i18n message files |
| `src/app/` | App bootstrap: i18n init, Google Analytics, service worker, global component registration |
| `src/assets/` | CSS (Tailwind theme + color palette), images |
| `src/sw.ts` | Service worker — handles caching strategy for PWA |

### Game Data (`src/data/`)

Static game data lives in `src/data/` as JSON files. Each domain has a base file (zh-TW, the primary locale) and optional locale-overlay files.

| File pattern | Domain |
|---|---|
| `skill.json` / `skill_main.json` | Skill trees and skill metadata |
| `equipment.json` | Equipment definitions |
| `crystal.json` | Crystal/gem data |
| `enchant.json` | Enchant system data |
| `stats.json` | Stat definitions |
| `character_stats.json` | Character stat base values |
| `glossary.json` | In-game terminology |
| `registlet.json` | Registlet data |
| `quest.json` | Quest data |
| `potion.json` | Potion data |

**Locale overlays** follow the pattern `<domain>.<suffix>.json` (e.g. `skill.en.json`, `skill.ja.json`, `skill.zh_cn.json`). The suffixes map to lang indices in `src/stores/app/datas/index.ts`: `0 → en`, `2 → ja`, `3 → zh_cn`; lang index 1 (zh-TW) uses the base file.

TypeScript types for each domain are in `src/data/types/`. The `useDatasStore` in `src/stores/app/datas/` lazy-loads base + locale JSON via dynamic imports and passes the data into the corresponding `Load*` utilities before handing it off to each `src/lib/` system module.

When adding data to an existing domain, edit the base `.json` and all locale overlay files. When adding a new domain, also add a type file under `src/data/types/`, a `Load*` utility in `src/stores/app/datas/utils/`, and wire it into `useDatasStore`.

### Data Flow

1. `DatasStoreBase` (Pinia store) lazily initializes game-system modules from `src/lib/` on first access.
2. `Grimoire` singleton wraps `DatasStoreBase` for convenient cross-module access.
3. View components consume data through stores and render feature-specific UI.
4. Router guards apply per-route styling state (`routerGuiding`) and update document title.

### State Management

- All global state lives in Pinia stores under `src/stores/`.
- `useMainStore` — app-level state and routing state.
- `useLocaleStore` — locale switching and lazy-loaded i18n messages. The root `App.vue` waits for `i18nMessageLoaded` before rendering.
- `useSettingStore` — persisted user preferences.
- Game data modules (Character, Skill, etc.) are instantiated inside `DatasStoreBase` and shared reactively.

### Routing & Navigation

Routes carry metadata that drives dynamic titles, `<meta>` tags, and left-menu button groups — avoid hard-coding these in components. `NavStore` manages breadcrumb state.

### Styling

- **Tailwind CSS 4** — utility-first, with source-aware compilation configured in `vite.config.ts`.
- Custom color palette via CSS custom properties (`--app-fuchsia-*`, `--app-violet-*`, etc.) defined in `src/assets/tailwind.css`. Use these variables rather than hard-coded colors.
- Theming is dynamic — component styles should reference CSS vars, not raw hex values.

### Internationalization

All user-visible strings must go through `vue-i18n`. Translation files live in `src/locales/`. New features need entries in all supported locale files.

### PWA / Service Worker

`vite-plugin-pwa` uses the `injectManifest` strategy with the custom `src/sw.ts` worker. Changes to caching behavior belong there.

## Key Libraries

| Library | Use |
|---|---|
| Vue 3.5 + Composition API | UI framework (always use `<script setup>`) |
| Pinia 3 | State management |
| Vue Router 4 | Routing with meta-driven navigation |
| Tailwind CSS 4 | Styling |
| vue-i18n 9 | Localization |
| Floating UI 1.5 | Tooltips and popovers |
| Marked 4 | Markdown rendering for in-app docs |
| Papa Parse 5 | CSV data import |
| Vue Draggable 4 | Drag-and-drop (equipment/build UIs) |
| DOMPurify 2 | Sanitize any user-supplied HTML before rendering |
| Iconify Vue 5 | Icons |

## Code Conventions

- **Prettier**: 100-char line length, 2-space indent. Import order enforced: `stores → shared → lib → components`.
- **ESLint**: `no-var`, Vue prop naming (PascalCase components, camelCase props in templates), block padding.
- Component composition: views compose small feature-specific components with logic extracted into composables.
- `@ ` alias maps to `/src`.
