# Changelog

All notable changes to Token Explorer are documented here.

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
