# Spec — steam-game-revenue-calculator

## Objective
Add a new single-file static calculator at `tools/steam-game-revenue-calculator/index.html` that estimates Steam premium-game take-home revenue after discounting, tax removal, refunds, Steam fee, per-copy support cost, and fixed launch spend.

## In Scope
1. `tools/steam-game-revenue-calculator/index.html`
2. Minimal catalog updates required for discoverability
   - `tools/index.html`
   - `tools/manifest.json`
   - `_data/tools-list.json`
3. Verification artifacts under `tmp/`

## Out of Scope
- Browser automation
- External APIs or live Steam data pulls
- Wishlist / funnel forecasting
- Ad revenue, DLC, bundle pricing, currency conversion, or regional mix modeling

## Functional Requirements

### FR-1 Inputs
The calculator must accept:
- Units sold
- List price (tax inclusive)
- Average discount rate (%)
- VAT/GST rate (%)
- Refund rate (%)
- Steam fee rate (%)
- Support / ops cost per copy
- Fixed launch cost

### FR-2 Outputs
The calculator must show at minimum:
- Gross sales after discount (tax inclusive)
- Revenue ex. tax
- Refund leakage
- Steam fee amount
- Steam net proceeds
- Total cost
- Net profit
- Net margin (%)
- Take-home per copy
- Break-even copies

### FR-3 Core formulas
Given:
- `realizedPriceInclTax = listPriceInclTax * (1 - discountRate)`
- `grossSalesInclTax = unitsSold * realizedPriceInclTax`
- `revenueExTax = grossSalesInclTax / (1 + vatRate)`
- `refundLeakage = revenueExTax * refundRate`
- `billableRevenueExTax = revenueExTax - refundLeakage`
- `steamFeeAmount = billableRevenueExTax * steamFeeRate`
- `steamNetProceeds = billableRevenueExTax - steamFeeAmount`
- `supportCostTotal = unitsSold * supportCostPerCopy`
- `totalCost = supportCostTotal + launchCost`
- `netProfit = steamNetProceeds - totalCost`
- `netMarginPct = netProfit / grossSalesInclTax * 100` when gross sales > 0, otherwise `NaN`
- `takeHomePerCopy = steamNetProceeds / unitsSold` when units sold > 0, otherwise `NaN`
- `contributionPerCopy = (realizedPriceInclTax / (1 + vatRate)) * (1 - refundRate) * (1 - steamFeeRate) - supportCostPerCopy`
- `breakEvenCopies = ceil(launchCost / contributionPerCopy)` when contribution per copy > 0, else `Infinity`

All percentage values are interpreted as percent inputs and converted to decimal form inside compute logic.

### FR-4 Validation
- Units sold must be `>= 0`
- List price must be `> 0`
- Discount, VAT/GST, refund, and Steam fee must be `>= 0` and `< 100`
- Support cost per copy and fixed launch cost must be `>= 0`
- Invalid input must show an error box and reset output fields

### FR-5 UX/UI
- Single `index.html`
- Responsive layout: desktop two-column, mobile one-column
- KO/EN toggle
- `Copy Summary` button
- `Reset Defaults` button
- Portal link `href="/"`
- Live recalculation on `input` and `change`
- Include `/assets/analytics.js`
- Include `TESTABLE_COMPUTE_START/END` markers around compute logic for extraction-based verification

## Acceptance Criteria
1. `tools/steam-game-revenue-calculator/index.html` exists and renders as a valid static page.
2. Manifest contains slug `steam-game-revenue-calculator` with canonical URL `/tools/steam-game-revenue-calculator/`.
3. `_data/tools-list.json` contains one matching entry with non-blank title and description.
4. `tools/index.html` contains one landing card for the new slug.
5. Local HTTP check returns `200` for `/tools/steam-game-revenue-calculator/`.
6. Extracted compute verification produces finite outputs for the baseline case and `Infinity` break-even for a negative-contribution case.
7. Verification outputs are written under `tmp/`.
