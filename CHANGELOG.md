# Changelog

All notable changes to Token Explorer are documented here.

## v1.4.1 — 2026-04-22

Intro panels no longer eat canvas space when expanded.

### Changed
- **IntroPanel reworked across all units.** What used to be a collapsible accordion (which, when expanded, shrank the Token Space canvas enough to hide the 3D spheres) is now a slim always-visible tagline row with a `Learn more →` button. Clicking opens the full content — `whyItMatters`, `concepts`, `furtherReading` — as a centered modal with a dimmed backdrop. Canvas stays at its maximum height regardless of reading state.
- Modal behavior: ESC key closes, backdrop click closes, background page scroll locks while open.
- Applied to every unit (Token Space, Tokenizer, Context Window, RAG, Predict) for a consistent language across the product.

## v1.4.0 — 2026-04-22

Token Space tab reworked into a desktop workbench layout to eliminate the scroll-vs-zoom conflict and keep the zoom controls always in reach.

### Changed
- **Token Space — desktop layout.** The tab now fills the viewport with no page scroll: a collapsible intro banner on top, the 3D canvas expanding to fill the remaining space (`flex: 1` with `min-height: 0`), and a compact bottom strip with selected-token details + prev/next nav. Scrolling on the canvas only zooms the camera; there is no longer a page scroll to conflict with, and the zoom/reset buttons stay pinned in the canvas's top-right.
- **Token Space — mobile layout.** Preserved as the existing vertical stack. Touch doesn't conflict with pinch-to-zoom, so nothing needed to change.
- **Selected-token details on desktop** render as a single horizontal row with horizontally-scrollable nearest-neighbor pills, instead of a tall card that pushed the canvas down.

### Added
- `useMediaQuery` hook at `src/shared/hooks/useMediaQuery.js` so other units can branch on viewport size the same way.

## v1.3.1 — 2026-04-22

### Fixed
- **Token Space canvas wasn't rendering** after the v1.2 layout change. The canvas wrapper used `flex: 1; min-height: 60vh` inside a scrollable parent, which collapsed to 0 on some browsers. Replaced with an explicit `height: min(70vh, 640px); min-height: 420px` so the canvas always has a real size.

### Changed
- Desktop content width bumped from 720px → 960px on Tokenizer, Context Window, RAG, and Predict so units breathe on larger screens while staying comfortable on mobile.
- Landing column widened from 720px → 820px.
- Tab strip now centers inside a 1040px max-width wrapper and keeps horizontal scroll as a fallback on narrow viewports.
- Token Space intro + selected-token panel centered in a 960px column; the 3D scene itself remains full-width below.

## v1.3.0 — 2026-04-22

Chapter 3 begins: **Predict** — the first unit on how LLMs actually generate text.

### Added
- **Predict unit** (`src/units/predict/`) with three views:
  - *Attention* — hover a token in a 5-token prefix to see which earlier tokens it attends to, rendered both as a spotlight row and as a full causal attention matrix heatmap.
  - *Next token* — hand-picked logit distribution per scenario, softmax'd through a live temperature slider (0–2). Click a bar to commit a token and see how auto-regression works. Watch the distribution sharpen at temperature 0 and flatten at temperature 2.
  - *Training vs. inference* — the same scenario shown as an inference pick and as a training step, with the correct token highlighted and arrows showing which probabilities get pushed up vs. down by the loss.
- Three scenarios: a **factual** completion (`The capital of France is ___`), a **code** completion (`function add(a, b) {`), and an **ambiguous** prose completion (`After the storm the town ___`). Every viz labels itself as illustrative — numbers are hand-picked, not a live model.
- `softmax(logits, temperature)` and seedable `mulberry32` / `hashString` helpers added to `src/shared/util.js` for this unit and future ones.
- Predict is wired into the curriculum (Chapter 3 — Intelligence), the tab strip (BarChart3 icon), and prev/next nav.
