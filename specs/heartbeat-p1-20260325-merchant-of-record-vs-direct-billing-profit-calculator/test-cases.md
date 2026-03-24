# Test Cases — Merchant of Record vs Direct Billing Profit Calculator

## TC-00 Preflight gap is real before implementation
Verify current-state drift:
- `tools/merchant-of-record-vs-direct-billing-profit-calculator/` does not exist
- manifest count is `0`
- `tools/index.html` exact count is `1`
- `tools/index.md` exact count is `1`
- `_data/tools-list.json` exact count is `1`
- `tools/app-store-vs-web-checkout-profit-calculator/index.html` exact chip count is `1`

## TC-01 Baseline fixture — MoR wins materially
Input:
- `monthlyOrders=500`
- `averageOrderValue=29`
- `refundRatePct=4`
- `chargebackRatePct=0.8`
- `directProcessorRatePct=2.9`
- `directProcessorFixedFee=0.30`
- `directTaxBurdenRatePct=10`
- `directComplianceMonthlyCost=299`
- `directBillingOpsMonthlyCost=199`
- `chargebackFeePerCase=15`
- `morFeeRatePct=5`
- `morFixedFeePerOrder=0.50`
- `morMonthlyCost=0`

Expected numeric outputs:
- `grossBillings = 14500.00`
- `refundLoss = 580.00`
- `recognizedRevenue = 13920.00`
- `chargebackOrders = 4.00`
- `chargebackRevenueLoss = 116.00`
- `directProcessorVariableFees = 420.50`
- `directProcessorFixedFees = 150.00`
- `directTaxBurden = 1392.00`
- `directChargebackFees = 60.00`
- `directNetTakeHome = 11283.50`
- `morFeeAmount = 696.00`
- `morFixedFees = 250.00`
- `morNetTakeHome = 12974.00`
- `monthlyDelta = 1690.50`
- `annualDelta = 20286.00`
- `breakEvenMorFeeRatePct ≈ 17.144397`
- `annualMorROI ≈ 178.699789`

Assertions:
- calculation is `ok=true`
- `morNetTakeHome > directNetTakeHome`
- `monthlyDelta > 0`
- current `morFeeRatePct=5` is well below break-even `17.144397`

## TC-02 Lean direct-billing fixture — direct wins
Input: same as TC-01 except
- `directTaxBurdenRatePct=0`
- `directComplianceMonthlyCost=50`
- `directBillingOpsMonthlyCost=50`
- `chargebackRatePct=0.3`

Expected numeric outputs:
- `chargebackOrders = 1.50`
- `chargebackRevenueLoss = 43.50`
- `directChargebackFees = 22.50`
- `directNetTakeHome = 13183.50`
- `morNetTakeHome = 12974.00`
- `monthlyDelta = -209.50`
- `annualDelta = -2514.00`
- `breakEvenMorFeeRatePct ≈ 3.494971`
- `annualMorROI ≈ -22.145877`

Assertions:
- calculation is `ok=true`
- `directNetTakeHome > morNetTakeHome`
- `monthlyDelta < 0`
- current `morFeeRatePct=5` is above break-even `3.494971`

## TC-03 Break-even threshold behavior
Compare three runs with the TC-01 baseline:
- below threshold: `morFeeRatePct=18`
- at/near threshold: `morFeeRatePct≈17.14`
- above threshold: `morFeeRatePct=20`

Assertions:
- below threshold still favors direct only if the rate is above break-even; at the exact break-even threshold, delta is approximately zero
- once `morFeeRatePct` moves above the computed threshold, `monthlyDelta` must turn negative

## TC-04 Validation rejects impossible values
Invalid examples:
- `monthlyOrders=0`
- `averageOrderValue<=0`
- any percent field `<0` or `>100`
- any fixed/monthly cost `<0`

Assertions:
- `ok=false`
- error list names the failing fields
- no result object is returned for invalid runs

## TC-05 Edge denominator handling
Use an extreme scenario where `recognizedRevenue <= 0` or `annualMorCost <= 0`.

Assertions:
- `breakEvenMorFeeRatePct = null` when the denominator is non-positive
- `annualMorROI = null` when annual MoR cost denominator is non-positive
- tool does not throw

## TC-06 HTML contract
After implementation, `index.html` must contain:
- a `<title>` with “Merchant of Record vs Direct Billing Profit Calculator”
- `/assets/analytics.js`
- labels/IDs for all input fields defined in the spec
- related links to:
  - `app-store-vs-web-checkout-profit-calculator`
  - `vat-gst-margin-calculator`
  - `stripe-fee-calculator`
  - `lemon-squeezy-fee-calculator`

## TC-07 Catalog exact-once contract
After implementation:
- `tools/index.html` link count = `1`
- `tools/index.md` link count = `1`
- `_data/tools-list.json` URL count = `1`
- `tools/manifest.json` exact slug/url count = `1`

This test is critical because the page is already promised in discovery and the follow-up run must not duplicate it.