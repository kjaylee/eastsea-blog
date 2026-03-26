# Gap Analysis — Stan Store Fee Calculator

## What shipped
- New exact-match monetization tool at `tools/stan-store-fee-calculator/`
- Pure calculator module with deterministic exports
- Static responsive page with:
  - four-plan comparison
  - refund and processor drag modeling
  - target-price math
  - Creator Pro payback output
  - copyable summary
- Exact-once discovery wiring in:
  - `_data/tools-list.json`
  - `tools/index.html`
  - `tools/index.md`
  - `tools/manifest.json`

## Remaining gaps
1. **No country selector for processor fees**
   - The shipped presets intentionally stay on public US/default baselines.
   - This is acceptable for v1 because the exact-match query intent is “what do Stan fees look like?” not “model every global processor combination.”

2. **No payout-fee cashflow modeling**
   - Stan’s help center mentions Stripe payout fees, but v1 does not simulate payout cadence or cross-currency payout drag.
   - The tool focuses on simpler take-home planning first.

3. **No feature-by-feature Creator Pro ROI attribution**
   - The tool only tells the user how much extra gross Pro would need to justify itself.
   - It does not predict revenue lift from specific Pro-only features like order bumps or affiliate management.

4. **Landing-page coverage still lags manifest coverage**
   - `tools/manifest.json` now lists `690` shipped tools.
   - `tools/index.html` currently exposes `675` cards.
   - This repo-wide surface gap predates this task; this change only adds Stan and reconciles the public page count to the actual card count.

## If iterating next
- Add optional payout-fee modeling and payout count assumptions.
- Add country/currency presets for PayPal and Stripe.
- Add a deeper “Creator Pro ROI” mode based on expected lift from upsells, payment plans, or affiliate sales.
