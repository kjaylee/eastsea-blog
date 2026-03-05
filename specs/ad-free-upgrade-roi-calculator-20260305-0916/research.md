# Research — ad-free-upgrade-roi-calculator

## Goal
Ship a new monetization calculator that models the ROI of offering an ad-free upgrade tier for an app/game.

## Existing repo patterns reviewed
1. `tools/mobile-ad-frequency-cap-roi-calculator/index.html`
   - Mobile-friendly ROI layout, KPI cards, and input structure.
2. `tools/api-credit-pack-breakage-roi-calculator/logic.mjs`
   - Validation, ROI math, break-even guard, summary generator.
3. `tools/api-credit-pack-breakage-roi-calculator/app.mjs`
   - LocalStorage persistence, render flow, copy-summary action.
4. `tools/index.html`, `tools/index.md`, `scripts/build-manifests.sh`
   - Discoverability references and manifest rebuild workflow.

## Product rationale
- Ad-supported apps often debate whether an ad-free tier will generate incremental profit.
- The decision depends on attach rate, lost ad ARPU, platform fees, and ongoing program cost.
- A fast calculator helps monetize without heavy modeling.

## Scope
- New slug: `/tools/ad-free-upgrade-roi-calculator/`
- Inputs: MAU, ad-exposed share, ad ARPU, ad-free price, attach rate, platform fee, service cost, monthly program cost, one-time setup cost, analysis horizon.
- Outputs: ad-free subscribers, net contribution per subscriber, net monthly benefit, period net benefit, ROI, payback months, break-even attach rate.
- Responsive UI with concise usage copy + copyable summary.
- Update tool index + manifest.
