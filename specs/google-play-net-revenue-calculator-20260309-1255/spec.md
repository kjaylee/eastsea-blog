# Spec — google-play-net-revenue-calculator

## Route
- Output path: `tools/google-play-net-revenue-calculator/index.html`
- Catalog files: `tools/manifest.json`, `_data/tools-list.json`

## Inputs
The page must expose these exact keys:
- `grossBillingsInclTax`
- `taxRate`
- `refundRate`
- `playFeeRate`
- `adRevenue`
- `uaSpend`
- `backendCost`
- `fixedCost`

## Outputs
`compute(v)` must return these exact keys:
- `recognizedGrossExTax`
- `refundedRevenueExTax`
- `billableRevenueExTax`
- `playFeeAmount`
- `playNetProceeds`
- `totalNetRevenue`
- `totalCost`
- `monthlyNetProfit`
- `netMarginPct`
- `takeHomeRatePct`
- `breakEvenGrossBillingsInclTax`

## UX / content requirements
- Single static page with responsive 2-column desktop / 1-column mobile layout
- English SEO title plus Korean-facing visible title/subtitle
- `KO` / `EN` toggle and `Back to Portal` link
- Input card with numeric fields, error box, summary textarea, copy/reset buttons
- Result card with 6 KPI tiles, status pill, and detail table
- Must include `/assets/analytics.js`
- Must include estimate disclaimer saying this is not an official Google Play settlement statement

## Formula contract
Let:
- `t = taxRate / 100`
- `r = refundRate / 100`
- `f = playFeeRate / 100`
- `factor = ((1 - r) * (1 - f)) / (1 + t)`

Then:
- `recognizedGrossExTax = grossBillingsInclTax / (1 + t)`
- `refundedRevenueExTax = recognizedGrossExTax * r`
- `billableRevenueExTax = recognizedGrossExTax - refundedRevenueExTax`
- `playFeeAmount = billableRevenueExTax * f`
- `playNetProceeds = billableRevenueExTax - playFeeAmount`
- `totalNetRevenue = playNetProceeds + adRevenue`
- `totalCost = uaSpend + backendCost + fixedCost`
- `monthlyNetProfit = totalNetRevenue - totalCost`
- `netMarginPct = monthlyNetProfit / grossBillingsInclTax * 100`
- `takeHomeRatePct = playNetProceeds / grossBillingsInclTax * 100`
- `breakEvenGrossBillingsInclTax = factor <= 0 ? Infinity : max(0, (totalCost - adRevenue) / factor)`

## Defaults
- `grossBillingsInclTax = 120000`
- `taxRate = 10`
- `refundRate = 3.5`
- `playFeeRate = 15`
- `adRevenue = 18000`
- `uaSpend = 22000`
- `backendCost = 7000`
- `fixedCost = 9000`

## Acceptance
1. The page is clearly Google Play-specific.
2. No MAU / ARPDAU / battle-pass style overlap fields appear.
3. Invalid rates show an error and clear KPI output.
4. Break-even displays `0` when ad revenue already covers cost.
5. Metadata/catalog entries resolve to this slug after verification.
