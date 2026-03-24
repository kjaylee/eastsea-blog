# Plan — Patreon Net Revenue Calculator

1) Scaffold files & i18n
- Create `tools/patreon-net-revenue-calculator/{index.html,calculator.js}` with EN/KR text.

2) Implement compute
- Pure `calculate(input,{lang})` in `calculator.js`, export constants, defaults, helper solvers.

3) UI wiring
- Inputs for three buckets, plan preset, processing tier knobs, refund, payout, costs, currency.
- Render KPIs, details, preset comparison, summary.

4) Tests
- Node tests for math (baseline, micro/standard boundary, invalids), summary tokens, HTML anchors.
- Catalog exact‑once tests vs `_data/tools-list.json`, `tools/manifest.json`, `tools/index.html`, `tools/index.md` (index pages already include slug; ensure JSONs updated).

5) Catalog wiring
- Append a single entry to `_data/tools-list.json` and `tools/manifest.json` (size populated from file).

6) Verification
- Localhost smoke: serve root, curl new page, attach snippet to `verification.md`.

7) Gap analysis & iterate
- Check catalog guard expectations, integration size bounds, add notes in `gap-analysis.md` plus remediation if needed.

