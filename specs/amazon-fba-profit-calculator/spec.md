# Spec — amazon-fba-profit-calculator

## Objective
Add one new static business calculator for Amazon FBA sellers that estimates per-unit economics, monthly profitability, payback, and break-even thresholds without any external dependencies.

## Deliverables
- `tools/amazon-fba-profit-calculator/index.html`
- `tools/amazon-fba-profit-calculator/app.mjs`
- `tools/amazon-fba-profit-calculator/logic.mjs`
- `tests/unit/amazon-fba-profit-calculator.test.mjs`
- `tools/index.html` card entry
- `tools/index.md` bullet entry
- `_data/tools-list.json` discovery entry
- regenerated `tools/manifest.json`
- verification artifacts under `tmp/`

## Functional requirements
1. User can enter FBA assumptions for units, price, referral fee, fulfillment fee, landed cost, prep cost, returns, ACoS, storage, overhead, launch cost, analysis months, and target net margin.
2. Tool computes and displays at least:
   - gross revenue
   - monthly net profit
   - net margin
   - profit per unit
   - period net profit
   - ROI
   - payback months
   - break-even units
   - break-even ACoS
   - required price for target net margin
3. Validation must reject impossible or out-of-range inputs and explain the issue in plain language.
4. Results update on `input` and `change` events.
5. User can copy a text summary and reset inputs to defaults.
6. Top-level page must include `href="/"` portal link.

## Non-functional requirements
- No browser automation or external API usage.
- Fully static and client-side.
- Mobile responsive at <= 900px with single-column layout.
- Use readable, deterministic JS modules suitable for `node --check` and `node --test`.
- Keep edits surgical; no unrelated refactors.

## Success criteria
- New tool route renders locally via static HTTP server.
- Unit tests pass.
- Catalog surfaces are synchronized.
- Manifest includes the new slug.
