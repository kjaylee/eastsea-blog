# Test Cases — Whop Fee Calculator

## Docs-only task checks
1. Artifact folder exists at `specs/heartbeat-queue-87-whop-fee-calculator-20260327/`.
2. Required docs exist:
   - `research.md`
   - `spec.md`
   - `plan.md`
   - `test-cases.md`
3. No implementation files exist for this task:
   - `tools/whop-fee-calculator/` should remain absent
   - `tools/index.html`, `tools/index.md`, `_data/tools-list.json`, and `tools/manifest.json` should continue to contain zero `whop-fee-calculator` entries

## Future calculator behavior
1. Baseline domestic-card case
   - Inputs: `salePrice=99`, `transactions=10`, all advanced toggles off, no seller costs, ACH payout disabled
   - Expect processor fee uses domestic baseline and fixed-per-transaction fee
   - Expect positive take-home and effective take rate under gross revenue

2. International-card case
   - Same as baseline, but `internationalSharePct=100`, `domesticSharePct=0`
   - Expect international surcharge to be greater than zero
   - Expect lower take-home than baseline

3. FX-conversion case
   - Same as international case, with `fxConversionSharePct=100`
   - Expect FX surcharge to be greater than zero
   - Expect lower take-home than case 2

4. Billing-automation toggle
   - Enable `billingEnabled`
   - Expect billing fee to appear at the configured percentage
   - Expect total fees and effective take rate to increase

5. Tax/remittance toggle
   - Enable `taxRemittanceEnabled`
   - Expect tax/remittance fee to appear
   - Expect summary text to mention this assumption

6. Affiliate-processing toggle
   - Enable `affiliateEnabled`
   - Expect affiliate-processing fee to appear
   - Expect take-home to decrease relative to the same no-affiliate scenario

7. Payout-method comparison
   - Run the same sales case with next-day ACH vs instant payout
   - Expect payout fee to differ by method
   - Expect instant payout take-home to be lower

8. Seller-cost overlay
   - Add `sellerCostPerSale` and `monthlyFixedCost`
   - Expect `netProfit` to be lower than `takeHomeBeforeSellerCosts`
   - Expect break-even price to rise

## Validation edge cases
1. Invalid share mix
   - `domesticSharePct + internationalSharePct != 100`
   - Expect validation error

2. Invalid FX mix
   - `fxConversionSharePct > internationalSharePct`
   - Expect validation error

3. Negative or nonsensical inputs
   - Negative sale price, costs, or transaction count
   - Expect validation error

4. Impossible break-even state
   - Override fee inputs so effective take rate is `>= 100%`
   - Expect break-even output to be `null` or a readable impossible-state message

## Discovery wiring tests for a later implementation
1. Exact-once checks after shipping
   - `tools/index.html` contains `whop-fee-calculator` exactly once
   - `tools/index.md` contains `whop-fee-calculator` exactly once
   - `_data/tools-list.json` contains `/tools/whop-fee-calculator/` exactly once
   - `tools/manifest.json` contains `whop-fee-calculator` exactly once

2. This task specifically
   - Before any future implementation, all four discovery counts should remain `0`
