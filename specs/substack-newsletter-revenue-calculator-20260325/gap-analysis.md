# Gap Analysis — Substack Newsletter Revenue Calculator

Discovery gap snapshot
- `_data/tools-list.json` already contains an entry for `/tools/substack-newsletter-revenue-calculator/`.
- `tools/index.html` and `tools/index.md` also contain a discovery card/link for this slug.
- Missing pieces prior to this task:
  - No `tools/substack-newsletter-revenue-calculator/` directory or page, so links were 404 locally.
  - No `tools/manifest.json` entry for the slug, causing catalog guard deltas (manifest count/slug mismatch).

Resolution in this change
- Implement the tool (UI + compute + tests) under `tools/substack-newsletter-revenue-calculator/`.
- Add a single manifest entry and bump `count` + `updatedAt`.
- Do not alter existing discovery cards to avoid duplicates.

Residual risks
- If future edits accidentally add a second tools-list entry or a second link card, catalog guard will report duplicates; current patch keeps exact‑once wiring.
- Fee assumptions can drift; the UI exposes editable fields and summary note points to keeping assumptions current.
