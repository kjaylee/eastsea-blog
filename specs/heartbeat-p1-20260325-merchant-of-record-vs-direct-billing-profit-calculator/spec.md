# Spec — Merchant of Record vs Direct Billing Profit Calculator

## Decision target
Create the missing tool page promised at:
- `/tools/merchant-of-record-vs-direct-billing-profit-calculator/`

This run does **not** ship implementation. It defines the contract for a surgical follow-up implementation.

## Scope
### In scope
- One static calculator page at `tools/merchant-of-record-vs-direct-billing-profit-calculator/index.html`
- One deterministic calculator engine at `tools/merchant-of-record-vs-direct-billing-profit-calculator/calculator.js`
- One Node test file at `tools/merchant-of-record-vs-direct-billing-profit-calculator/calculator.test.js`
- One exact manifest entry in `tools/manifest.json`
- Reuse existing discovery promises already present in:
  - `tools/index.html`
  - `tools/index.md`
  - `_data/tools-list.json`

### Out of scope for v1
- Provider-specific checkout logic for every MoR vendor
- country-by-country VAT tables or nexus automation
- separate B2B reverse-charge logic
- tax-exclusive vs tax-inclusive checkout branching
- refunds with processor-fee partial clawback rules per processor
- dynamic currency conversion or FX spread modeling

## Core user question
“For my current sales volume and price point, does direct billing keep more money, or does paying a Merchant of Record still win once I include tax/compliance/chargeback burden?”

## Audience
- SaaS founders
- indie app developers
- creator-software operators
- digital product sellers comparing Stripe/direct checkout vs MoR platforms such as Paddle/Lemon Squeezy

## Inputs
### Shared sales inputs
- `monthlyOrders` — integer, `> 0`, default `500`
- `averageOrderValue` — number, `> 0`, default `29`
- `refundRatePct` — rate `0..100`, default `4`
- `chargebackRatePct` — rate `0..100`, default `0.8`

### Direct billing inputs
- `directProcessorRatePct` — rate `0..100`, default `2.9`
- `directProcessorFixedFee` — number `>= 0`, default `0.30`
- `directTaxBurdenRatePct` — rate `0..100`, default `10`
- `directComplianceMonthlyCost` — number `>= 0`, default `299`
- `directBillingOpsMonthlyCost` — number `>= 0`, default `199`
- `chargebackFeePerCase` — number `>= 0`, default `15`

### MoR inputs
- `morFeeRatePct` — rate `0..100`, default `5`
- `morFixedFeePerOrder` — number `>= 0`, default `0.50`
- `morMonthlyCost` — number `>= 0`, default `0`

## Derived values and formulas
Use decimal rates internally.

Definitions:
- `grossBillings = monthlyOrders * averageOrderValue`
- `refundLoss = grossBillings * refundRate`
- `recognizedRevenue = grossBillings - refundLoss`
- `chargebackOrders = monthlyOrders * chargebackRate`
- `chargebackRevenueLoss = averageOrderValue * chargebackOrders`

### Direct billing cost stack
- `directProcessorVariableFees = grossBillings * directProcessorRate`
- `directProcessorFixedFees = monthlyOrders * directProcessorFixedFee`
- `directTaxBurden = recognizedRevenue * directTaxBurdenRate`
- `directChargebackFees = chargebackOrders * chargebackFeePerCase`
- `directNetTakeHome = recognizedRevenue - directTaxBurden - directProcessorVariableFees - directProcessorFixedFees - chargebackRevenueLoss - directChargebackFees - directComplianceMonthlyCost - directBillingOpsMonthlyCost`

### Merchant of Record cost stack
- `morFeeAmount = recognizedRevenue * morFeeRate`
- `morFixedFees = monthlyOrders * morFixedFeePerOrder`
- `morNetTakeHome = recognizedRevenue - morFeeAmount - morFixedFees - morMonthlyCost`

### Comparison outputs
- `monthlyDelta = morNetTakeHome - directNetTakeHome`
- `annualDelta = monthlyDelta * 12`
- `breakEvenMorFeeRatePct = ((recognizedRevenue - morFixedFees - morMonthlyCost) - directNetTakeHome) / recognizedRevenue * 100`
- `annualMorCost = (morFeeAmount + morFixedFees + morMonthlyCost) * 12`
- `annualMorROI = annualDelta / annualMorCost * 100`

### Null / edge behavior
Return `null` for `breakEvenMorFeeRatePct` and `annualMorROI` when the denominator is `<= 0`.

## Golden fixture contract
Fixture A — baseline MoR-wins scenario:
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

Expected outputs:
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

Fixture B — lean direct-billing scenario:
- same as Fixture A except:
  - `directTaxBurdenRatePct=0`
  - `directComplianceMonthlyCost=50`
  - `directBillingOpsMonthlyCost=50`
  - `chargebackRatePct=0.3`

Expected outputs:
- `chargebackOrders = 1.50`
- `chargebackRevenueLoss = 43.50`
- `directChargebackFees = 22.50`
- `directNetTakeHome = 13183.50`
- `morNetTakeHome = 12974.00`
- `monthlyDelta = -209.50`
- `annualDelta = -2514.00`
- `breakEvenMorFeeRatePct ≈ 3.494971`
- `annualMorROI ≈ -22.145877`

## UX contract
### Page structure
1. Hero/title + one-sentence promise
2. Short assumption note: “Rates are editable; tax and dispute policies vary by country/provider.”
3. Input grid with three groups:
   - sales volume
   - direct billing stack
   - Merchant of Record stack
4. Result cards:
   - direct billing net
   - MoR net
   - monthly delta
   - break-even MoR fee rate
5. Breakdown table for line-item costs
6. Summary paragraph that states which model wins and why
7. Related-tool chips linking to:
   - `/tools/app-store-vs-web-checkout-profit-calculator/`
   - `/tools/vat-gst-margin-calculator/`
   - `/tools/stripe-fee-calculator/`
   - `/tools/lemon-squeezy-fee-calculator/`

### Copy style
- bilingual but concise
- operator-facing, not beginner tutorial tone
- emphasize planning estimate, not accounting/legal advice

## Discovery and wiring contract
### Must add
- exactly one manifest entry in `tools/manifest.json`

### Must **not** duplicate
Do **not** add another copy of the slug to:
- `tools/index.html`
- `tools/index.md`
- `_data/tools-list.json`

Those surfaces already reference the slug exactly once.

## Acceptance criteria
1. `tools/merchant-of-record-vs-direct-billing-profit-calculator/index.html` exists and includes a proper `<title>` plus `/assets/analytics.js`.
2. `calculator.js` exports deterministic logic usable from Node tests.
3. `calculator.test.js` covers both golden fixtures, edge cases, and exact-once catalog checks.
4. `tools/manifest.json` includes the slug exactly once.
5. `tools/index.html`, `tools/index.md`, and `_data/tools-list.json` still reference the slug exactly once after implementation.
6. No implementation report may claim shipping until the commands in `verification.md` actually pass.