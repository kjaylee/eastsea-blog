# Research — affiliate-cookie-window-roi-calculator

## Goal
Ship one new monetization calculator focused on affiliate attribution cookie-window expansion economics.

## Existing patterns reviewed
1. `tools/loyalty-points-redemption-margin-calculator/index.html`
   - Compact KPI-first UI with two-column responsive layout and bilingual labels.
2. `tools/index.html`, `tools/index.md`, `tools/manifest.json`
   - Required discoverability wiring for new tool surfacing.
3. Validation/testing pattern from existing calculator additions
   - Keep deterministic formula in separate JS for `node --check` and `node --test` coverage.

## Product rationale
Affiliate teams frequently extend attribution windows (7→14/30 days) without clear unit-economics impact. This calculator turns that decision into incremental orders, net contribution, ROI, and break-even CVR.
