# Quality Loop — Patreon Net Revenue Calculator

Red team checklist
- Inputs validation: reject negatives, rates ≥ 100, bucket requires orders when gross > 0.
- Micro/standard threshold edge: test exactly at $3 and around it.
- Catalog exact‑once: assert presence in `_data/tools-list.json` and `tools/manifest.json`; index pages already contain slug.
- Integration constraints: manifest `size` within 500..1,048,576 bytes.

Instrumentation & tests
- Node tests cover math baselines, validation, threshold behavior, summary tokens, and catalog wiring.
- Snapshot‑style assertions use loose tolerances to avoid brittle float comparisons.

Operational guardrails
- Keep all assumptions editable in UI.
- Ship clear disclaimers and “not a tax document” language.
- Prefer simple bisection solvers with iteration caps for target price/gross.

Maintenance
- If Patreon updates public fees, adjust defaults and keep presets editable.
- Avoid touching unrelated catalog entries; run data‑consistency tests if available.

