# Spec — Thinkific Fee Calculator

## Summary
Build a static tool at `tools/thinkific-fee-calculator/` that helps course creators estimate actual take-home on Thinkific after plan cost, payment-processing fees, optional recurring/tax surcharges, and Thinkific’s extra third-party gateway fee.

## Primary user
- Course creator or edu-business operator already selling on Thinkific, or evaluating a move to it
- Usually comparing Basic vs Start vs Grow economics
- Wants a fast answer to “what do I really keep?”

## Core user stories
1. As a creator, I want to enter order volume and average order value so I can see monthly gross sales and net take-home.
2. As a creator, I want to compare Thinkific Payments vs third-party gateway economics so I can choose the cheaper payment setup.
3. As a creator, I want the Basic / Start / Grow fee differences modeled so I can see when upgrading pays for itself.
4. As a creator, I want the `$1M` annual third-party fee cap reflected so the result is not overstated.
5. As a creator, I want a copyable summary I can paste into planning docs.

## Page requirements
- Static HTML page under `tools/thinkific-fee-calculator/`
- No framework or build-time dependency required for the page itself
- Pure `calculator.js` exports for deterministic Node tests
- Responsive UI with clear inputs, KPI cards, detail rows, and plan-comparison table
- Canonical, description, OG/Twitter, and WebApplication schema metadata
- Back link to `/tools/`
- Related links to adjacent creator-platform tools

## Supported plans in v1
### Public plans with published pricing
- `basic`
- `start`
- `grow`

### Out of scope for direct modeling
- `plus`
- `expand`
- legacy plans

Reason: Plus / Expand are not fully public on the main pricing page and would require custom-quote assumptions.

## Inputs
- `planTier` (`basic` | `start` | `grow`)
- `billingMode` (`monthly` | `annual`)
- `ordersPerMonth` (positive integer)
- `averageOrderValue` (> 0)
- `paymentSetup` (`thinkific-payments` | `third-party-gateway`)
- `processorPreset` (`us-card` | `uk-card` | `eea-card` | `custom`)
- `processingVariableRatePct` (>= 0)
- `processingFixedFee` (>= 0)
- `isSubscriptionOrPaymentPlan` (boolean)
- `applySalesTaxVatSolutionFee` (boolean)
- `refundRatePct` (0 <= x < 100)
- `yearToDateThirdPartySales` (>= 0)
- `otherMonthlyCosts` (>= 0)
- `desiredMonthlyNetProfit` (>= 0)

## Published constants to model
### Plan cost
#### Monthly billing
- Basic: `$49`
- Start: `$99`
- Grow: `$199`

#### Annual billing monthly-equivalent
- Basic: `$36`
- Start: `$74`
- Grow: `$149`

### Extra Thinkific third-party gateway fee
Applies only when `paymentSetup = third-party-gateway`.
- Basic: `5.0%`
- Start: `2.0%`
- Grow: `1.0%`

### Third-party gateway fee cap
- Extra fee only applies to the **first `$1,000,000`** in sales per calendar year.
- If `yearToDateThirdPartySales >= 1,000,000`, extra Thinkific gateway fee for the current month is `0`.
- If the current month crosses the cap, only the fee-exposed portion of current-month gross sales should incur the extra gateway fee.

### Processor preset defaults
Used only as convenience defaults; user may override.
- `us-card`: `2.9% + 0.30`
- `uk-card`: `1.7% + 0.20`
- `eea-card`: `1.7% + 0.25`
- `custom`: user-entered

### Optional Thinkific Payments surcharges
- Subscription / payment-plan surcharge: `+0.7%`
- Sales Tax & VAT solution fee: `+0.5%` when applied

## Calculation rules
### Base values
- `monthlyGrossSales = ordersPerMonth * averageOrderValue`
- `refundRate = refundRatePct / 100`
- `refundLoss = monthlyGrossSales * refundRate`
- `planCost = publishedPlanCost(planTier, billingMode)`

### Extra gateway-fee exposure
When `paymentSetup = third-party-gateway`:
- `remainingCap = max(0, 1000000 - yearToDateThirdPartySales)`
- `feeExposedGross = min(monthlyGrossSales, remainingCap)`
- `thirdPartyGatewayFee = feeExposedGross * extraGatewayRate(planTier)`

When `paymentSetup = thinkific-payments`:
- `feeExposedGross = 0`
- `thirdPartyGatewayFee = 0`

### Processing-rate composition
Start with the chosen preset or custom values:
- `baseProcessingRate`
- `baseProcessingFixedFee`

Then add optional surcharges:
- `subscriptionSurcharge = 0.7%` only when `paymentSetup = thinkific-payments` and `isSubscriptionOrPaymentPlan = true`
- `salesTaxVatSurcharge = 0.5%` only when `applySalesTaxVatSolutionFee = true`

- `effectiveProcessingVariableRate = baseProcessingRate + subscriptionSurcharge + salesTaxVatSurcharge`
- `processingFees = monthlyGrossSales * effectiveProcessingVariableRate + ordersPerMonth * baseProcessingFixedFee`

### Profit math
- `takeHomeAfterPlatformAndPayments = monthlyGrossSales - refundLoss - planCost - thirdPartyGatewayFee - processingFees`
- `monthlyNetProfit = takeHomeAfterPlatformAndPayments - otherMonthlyCosts`
- `annualizedNetProfit = monthlyNetProfit * 12`

### Effective take rate
- `platformAndPaymentDrag = refundLoss + planCost + thirdPartyGatewayFee + processingFees`
- `effectiveTakeRate = platformAndPaymentDrag / monthlyGrossSales`
- Return `0` when gross sales are `0`, though validation should normally reject zero-order scenarios.

### Contribution per order
- `contributionPerOrder = averageOrderValue * (1 - refundRate - effectiveProcessingVariableRate - extraGatewayRateAppliedToMarginalOrder) - baseProcessingFixedFee`

For break-even math:
- if `paymentSetup = third-party-gateway` and under the cap, use the plan’s extra gateway fee in the marginal-order contribution
- if above the cap, marginal extra gateway fee becomes `0`

### Break-even orders
- `breakEvenOrders = (planCost + otherMonthlyCosts) / contributionPerOrder`
- Return `null` if `contributionPerOrder <= 0`

### Required orders for target net
- `requiredOrdersForTargetNet = (planCost + otherMonthlyCosts + desiredMonthlyNetProfit) / contributionPerOrder`
- Return `null` if `contributionPerOrder <= 0`

### Plan-comparison thresholds
Only meaningful when `paymentSetup = third-party-gateway`.

#### Basic → Start threshold
- `basicToStartGrossThreshold = (startPlanCost - basicPlanCost) / (basicGatewayRate - startGatewayRate)`

#### Start → Grow threshold
- `startToGrowGrossThreshold = (growPlanCost - startPlanCost) / (startGatewayRate - growGatewayRate)`

When `paymentSetup = thinkific-payments`, set both threshold outputs to `null` and explain that monetization-only thresholds disappear because the extra gateway fee is not charged.

## Required outputs
### KPI cards
- Monthly gross sales
- Take-home after platform + payments
- Monthly net profit
- Effective take rate
- Break-even orders
- Required orders for target net

### Detail rows
- Selected plan cost
- Selected processor preset
- Effective processing variable rate
- Processing fixed-fee total
- Extra Thinkific third-party gateway fee
- Refund loss
- Remaining third-party fee cap after current month
- Annualized net profit
- Target-order gap vs current order count

### Comparison table
Compare `basic`, `start`, and `grow` under the same inputs:
- Plan label
- Plan cost
- Extra gateway rate
- Processing fees
- Extra gateway fee
- Take-home after platform + payments
- Monthly net profit

### Recommendation block
- Recommend the plan with the highest monthly net profit under the current assumptions
- Add concise explanation when a more expensive plan wins because lower extra gateway fees outweigh plan cost

### Copyable summary
Must include:
- selected plan and billing mode
- monthly gross sales
- payment setup
- processing-rate assumptions
- extra Thinkific gateway fee
- monthly net profit
- threshold insight (if applicable)

## Discovery wiring requirements
When implemented, wire the slug exactly once into:
- `tools/index.html`
- `tools/index.md`
- `_data/tools-list.json`
- `tools/manifest.json`

## Non-goals
- No Plus / custom enterprise quote estimator
- No full country-by-country payout engine
- No BNPL / bank redirect / invoicing flow matrix in v1
- No FX or payout-delay cashflow forecasting
- No churn / LTV simulator
- No tax-jurisdiction calculator beyond the published 0.5% solution-fee toggle

## Done criteria
- Tool page exists and renders locally
- Pure math module is fully covered by deterministic Node tests
- Discovery surfaces include the slug exactly once
- Manifest includes the slug after rebuild
- Local HTTP check returns 200 for the page
- Verification and gap-analysis artifacts are written after implementation
