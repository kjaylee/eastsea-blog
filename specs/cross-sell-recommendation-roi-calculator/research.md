# Research — cross-sell-recommendation-roi-calculator

## Goal
Build a new monetization calculator that models cross-sell recommendation economics (exposure → take rate → net profit) with ROI, payback, and break-even take rate.

## References reviewed
- `tools/upsell-conversion-profit-calculator/index.html` (Korean ROI calculator layout + KPI structure)
- `tools/api-credit-pack-breakage-roi-calculator/index.html` (two-column responsive UI + summary area)
- `tools/api-credit-pack-breakage-roi-calculator/app.mjs` + `logic.mjs` (modular JS pattern, localStorage, validation)
- `tools/index.html` (tool card list + tags)
- `tools/index.md` (markdown listing format)
- `scripts/build-manifests.sh` (manifest regeneration)

## Key takeaways
- New tools are typically self-contained under `tools/<slug>/` and often use `index.html` + `app.mjs` + `logic.mjs` for clean syntax checks.
- ROI calculators expose inputs, KPIs, detail table, summary copy, localStorage, and mobile-friendly layout.
- Discovery requires adding a new tool card to `tools/index.html`, an entry to `tools/index.md`, and updating `tools/manifest.json`.

## Proposed model
- Inputs: monthly orders, baseline AOV, exposure rate, take rate, cross-sell price, COGS, fulfillment, refund rate, monthly tool/ops cost, one-time setup, analysis months, target payback.
- Outputs: net cross-sell revenue, contribution margin, monthly net profit, period net benefit, ROI, payback months, AOV lift, break-even take rate.

## Verification plan
- `node --check` for `tools/cross-sell-recommendation-roi-calculator/app.mjs` and `logic.mjs`.
- Local static server + `curl` to confirm HTTP 200 for `/tools/cross-sell-recommendation-roi-calculator/`.
