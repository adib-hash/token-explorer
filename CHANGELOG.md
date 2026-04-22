# Changelog

All notable changes to Token Explorer are documented here.

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
