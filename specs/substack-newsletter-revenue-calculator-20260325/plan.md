# Plan — Substack Newsletter Revenue Calculator

1) Scaffold compute + UI
- Create `tools/substack-newsletter-revenue-calculator/` with `index.html`, `calculator.js`, `calculator.test.js`.
- Mirror `substack-fee-calculator` structure for formatting/validation helpers and node compatibility.

2) Wire catalog manifest
- Append manifest entry in `tools/manifest.json` with correct `size` of `index.html`, bump `count`, refresh `updatedAt`.
- Discovery cards already exist in `tools/index.html`, `tools/index.md`, `_data/tools-list.json` (no duplicate edits).

3) Tests
- Add `node:test` unit tests covering:
  - Baseline compute (monthly + annual + founding) with approximate checks
  - Derive‑paid mode from audience size and conversion rate
  - Validation rejections for out‑of‑range inputs
  - HTML includes `/assets/analytics.js` and the local calculator script
  - Discovery exact‑once wiring across catalog/manifest

4) Local smoke
- `python3 -m http.server 4173` then `curl` GET the tool page and grep for title and labels.

5) Verify catalog guard (manual check)
- Ensure `tools/manifest.json` entry count equals filesystem; no duplicate tools in `_data/tools-list.json`.

