# Changelog

All notable changes to Token Explorer are documented here.

## v1.1.0 — 2026-04-22

### Refactor
- Split the 1,952-line `src/TokenExplorer.jsx` into a modular structure: `src/App.jsx` (shell), `src/theme.js` (design tokens), `src/shared/util.js` (tokenizer, similarity, softmax, seeded RNG), and one folder per unit under `src/units/` (Token Space, Tokenizer, Context Window, RAG).
- No behavioral changes to any of the four existing visualizations — this is a pure move operation to prepare for Predict / Reason / Agents units and chapter-based navigation.
- Home button (app title) now remounts the current unit via a reset key instead of carrying cross-unit reset state.

### Added
- `lucide-react` dependency (not yet used; staged for Phase 2 emoji cleanup).
- Seedable RNG (`mulberry32`) and `softmax` helpers in `shared/util.js` for upcoming Predict unit.
