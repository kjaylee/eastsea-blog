# Implementation — chargeback-representment-roi-calculator

## Files added
- `tools/chargeback-representment-roi-calculator/index.html`
- `tools/chargeback-representment-roi-calculator/app.mjs`
- `tools/chargeback-representment-roi-calculator/logic.mjs`
- `tests/unit/chargeback-representment-roi-calculator.test.mjs`

## What was implemented
- Pure calculator logic with bounded validation and deterministic ROI math.
- Responsive static UI with:
  - 11 inputs,
  - 8 KPI cards,
  - recovery-driver table,
  - localStorage persistence,
  - reset-to-defaults,
  - copy-summary output,
  - explicit invalid-input error state.
- Manifest inclusion via `scripts/build-manifests.sh`.

## Key modeling choices
- Recovered value per won dispute = `averageOrderValue + chargebackFeePerCase`.
- Variable evidence cost scales with projected wins.
- Vendor + platform fees apply to incremental recovered revenue only.
- Break-even projected win rate solves for the recovery increase needed to offset fixed cost and evidence cost after fee drag.
- Payback returns `Infinity` when the modeled program does not pay back.
