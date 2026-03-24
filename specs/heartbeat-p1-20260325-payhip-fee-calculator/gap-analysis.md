# Gap Analysis — Payhip Fee Calculator

## What shipped
- Real static tool bundle at `tools/payhip-fee-calculator/`
- Pure calculator API with tests
- Responsive HTML page with summary copy, comparison table, and upgrade-threshold table
- Manifest backfill via rebuild
- Existing tools-list entry upgraded with better metadata

## Remaining gaps
1. **No country-specific processor matrix**
   - Current presets are deliberately conservative baselines only.
   - Especially true for PayPal fixed fees, which vary by currency.

2. **No payout-delay or cash-drag model**
   - Stripe and PayPal payout timing is documented in research but not modeled.
   - Acceptable for v1 because the spec prioritized clean fee comparison first.

3. **No tax/VAT handling**
   - Left out on purpose to avoid mixing platform-fee planning with jurisdiction-specific tax logic.

4. **Repo-wide discovery debt still exists**
   - `tool-catalog-guard.py` reports many unrelated missing entries / stale counts.
   - This Payhip tool is not the cause, but full green guard status requires separate catalog repair.

## If iterating next
- Add localized static-label switching instead of summary-only toggle.
- Add optional payout-drag assumption.
- Add country/currency selector for PayPal flat fee baselines.
- Pair this with the already-promised `kajabi-fee-calculator` or `airbnb-host-fee-calculator` to continue closing monetization-cluster gaps.
