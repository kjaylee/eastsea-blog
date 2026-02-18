# Spec — P1 Monetization Tools Trio (2026-02-19 04:06 KST)

## Goal
Ship 3 **new** business/monetization calculators in `eastsea-blog/tools/` to increase productive utility inventory (no game work):

1. `subscription-mrr-forecast-calculator`
2. `affiliate-commission-planner`
3. `marketplace-fee-profit-calculator`

## Mandatory Requirements
- Each tool is a **single-file** `index.html` with **inline CSS/JS**.
- Must be mobile responsive.
- Must include robust calculator logic + strict input validation.
- Must include **Back to Portal** link with exact `href='/'`.
- Must follow SDD/TDD sequence under `specs/{feature}`: `spec.md → plan.md → test-cases.md → tasks.md → implementation`.
- Update:
  - `tools/manifest.json`
  - `_data/tools-list.json`
- Deploy via git push in `eastsea-blog` only, then verify each new URL returns HTTP 200.

## Tool-Level Functional Scope

### 1) Subscription MRR Forecast Calculator
Inputs:
- Starting customers
- Initial ARPU
- Monthly new customers
- Monthly churn rate (%)
- Monthly ARPU growth (%)
- Forecast months (1–36)
- Fixed monthly cost

Outputs:
- End-of-period customers
- End MRR
- Cumulative revenue
- Cumulative gross profit (revenue - fixed cost)
- Net MRR gain and average monthly growth
- First 12 months projection table

Validation:
- Positive customer/ARPU/new values
- churn in [0, 100), ARPU growth in [-50, 200], months in [1, 36]
- prevent NaN/Infinity and negative impossible outcomes

### 2) Affiliate Commission Planner
Inputs:
- Product price
- Monthly referred orders
- Refund rate (%)
- Tier-1 commission rate (%)
- Tier-1 cap orders
- Tier-2 commission rate (%) for excess orders
- Performance bonus per valid order
- Network fee (%) deducted from commission

Outputs:
- Gross sales and valid orders
- Tiered commission subtotal
- Bonus amount
- Network fee and final payout
- Effective payout rate vs gross sales
- Merchant retained revenue estimate

Validation:
- Non-negative numeric bounds
- Rate bounds [0, 100]
- cap/orders consistency
- valid orders must be non-negative

### 3) Marketplace Fee Profit Calculator
Inputs:
- Listing price
- Product cost (COGS)
- Outbound shipping cost
- Marketplace fee (% + fixed)
- Payment fee (% + fixed)
- Ad spend per order
- Return rate (%)
- Return handling loss (amount per returned order)
- Target net margin (%)

Outputs:
- Expected net profit per order (returns-adjusted)
- Expected net margin
- Total fee burden per order
- Break-even price
- Price required for target margin

Validation:
- Price > 0, cost/fees non-negative
- rates within [0, 100)
- denominator checks for break-even and target formulas

## Non-Goals
- Any game polishing or game feature work
- Backend/API dependencies
- Multi-file bundling/build tooling changes
