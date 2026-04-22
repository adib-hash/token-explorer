# Changelog

All notable changes to Token Explorer are documented here.

## v1.2.0 — 2026-04-22

Token becomes a teaching app, not just a demo reel.

### Added
- **Landing page** (`src/landing/Landing.jsx`) — new default view with three chapter cards, per-unit progress checkmarks, and "Continue where you left off" CTA when a previous unit is saved.
- **Chapters** — units are now grouped: Chapter 1 *Foundations* (Token Space, Tokenizer), Chapter 2 *Memory* (Context Window, RAG), Chapter 3 *Intelligence* (Predict / Reason / Agents coming in upcoming releases).
- **IntroPanel** (`src/shared/ui/IntroPanel.jsx`) — every unit now opens with a collapsible "Why this matters" block: concept chips, a one-paragraph motivation, and curated further-reading links. Collapsed state is remembered per unit.
- **UnitNav** (`src/shared/ui/UnitNav.jsx`) — previous / home / next navigation at the bottom of every unit, derived from the curriculum ordering.
- **Curriculum source of truth** (`src/shared/data/curriculum.js`) — one place to define chapters, units, icons, intro copy, concepts, further reading.
- **Progress persistence** — `completedUnits` and `lastUnitId` are stored in localStorage under the `token:v1:` prefix.

### Changed
- Tab strip now uses **Lucide icons** (Orbit, Scissors, PanelTop, Search) instead of emojis, with a Home icon to jump back to the landing page.
- RAG chunk icons replaced with themed Lucide icons (Citrus, Cherry, Salad, Sun, Pill, Milk, Leaf) on tinted circular backgrounds — no more emoji in the UI.
- Context Window's overflow warning uses a Lucide `AlertTriangle` instead of the `⚠` emoji.
- `index.html` title updated to "Token — a visual guide to LLMs"; body no longer locks `overflow: hidden` so the landing page can scroll on mobile.
- App shell now renders the landing by default. The "Token" logo click returns to the landing; click again from the landing to reset all local state.
