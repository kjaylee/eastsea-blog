# Spec — Limited-time Offer Profit Calculator

## Goal
Create a practical ROI/profit calculator to model limited-time offer (LTO) discounts and conversion uplift, delivering monthly/period net impact, ROI, payback, and break-even target conversion.

## Tool slug
`limited-time-offer-profit-calculator`

## Inputs
- Monthly sessions (visits)
- Baseline conversion rate (%)
- Target conversion rate with offer (%)
- Average order value (USD)
- Gross margin (%)
- Offer discount (%)
- Offer adoption share of orders (%)
- Extra fulfillment cost per offer order (USD)
- Monthly promo cost (USD)
- One-time setup cost (USD)
- Analysis period (months)
- Target payback months

## Outputs (KPI)
- Baseline monthly net profit
- Offer monthly net profit
- Monthly net lift
- Period net benefit
- ROI (%)
- Payback months
- Break-even target conversion rate (%)

## Detail metrics
- Baseline orders, target orders, offer orders
- Average selling price after discount
- Net contribution per order (after discount + fulfillment)
- Monthly offer fulfillment cost

## Calculation model
- `baselineOrders = sessions * baselineConv`
- `targetOrders = sessions * targetConv`
- `offerOrders = targetOrders * offerShare`
- `profitPerNonOffer = AOV * grossMargin`
- `profitPerOffer = AOV * (grossMargin - discount)` (COGS fixed)
- `targetGrossProfit = (targetOrders - offerOrders) * profitPerNonOffer + offerOrders * profitPerOffer`
- `monthlyOfferFulfillmentCost = offerOrders * extraFulfillmentCost`
- `targetNetMonthly = targetGrossProfit - monthlyOfferFulfillmentCost - monthlyPromoCost`
- `baselineNetMonthly = baselineOrders * profitPerNonOffer`
- `monthlyNetLift = targetNetMonthly - baselineNetMonthly`
- `periodNetBenefit = monthlyNetLift * months - setupCost`
- `totalProgramCost = setupCost + (monthlyPromoCost + monthlyOfferFulfillmentCost) * months`
- `roiPct = periodNetBenefit / totalProgramCost * 100` (when totalProgramCost > 0)
- `paybackMonths = setupCost / monthlyNetLift` (if monthlyNetLift > 0)
- Break-even target conversion:
  - `denom = sessions * (profitPerNonOffer - offerShare * (AOV * discount + extraFulfillmentCost))`
  - `breakEvenTargetConv = (monthlyPromoCost + baselineOrders * profitPerNonOffer) / denom`

## UI/UX
- Two-column grid with inputs + KPI snapshot, mobile breakpoint at 900px.
- Concise copy, summary textarea, Copy Summary + Reset Defaults buttons.
- Status pill: strong / watch / weak based on periodNetBenefit and target payback.
- Include `/assets/analytics.js`.

## Storage
- Persist inputs to localStorage (`limited_time_offer_profit_calculator_v1`).

## Files
- `tools/limited-time-offer-profit-calculator/index.html`
- `tools/limited-time-offer-profit-calculator/app.mjs`
- `tools/limited-time-offer-profit-calculator/logic.mjs`
- Update `tools/index.html`, `tools/index.md`, and `tools/manifest.json` (via script).
