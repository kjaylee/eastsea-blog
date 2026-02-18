# Test Cases — P1 Monetization Tools Trio (2026-02-19 04:06 KST)

## A. Structure / Compliance
- [ ] `tools/subscription-mrr-forecast-calculator/index.html` exists
- [ ] `tools/affiliate-commission-planner/index.html` exists
- [ ] `tools/marketplace-fee-profit-calculator/index.html` exists
- [ ] All 3 files are single-page with inline CSS/JS
- [ ] All 3 pages include `<a ... href='/' ...>Back to Portal</a>`
- [ ] Mobile viewport (360px) remains usable with single-column layout

## B. Calculator Logic + Validation

### B1. Subscription MRR Forecast Calculator
1. Baseline scenario returns non-empty end customers, end MRR, cumulative revenue, growth stats.
2. `churnRate >= 100` triggers validation error.
3. `months = 0` or `months > 36` triggers validation error.

### B2. Affiliate Commission Planner
1. Baseline scenario computes tier-1/tier-2 split commission and final payout.
2. `refundRate > 100` triggers validation error.
3. Negative product price or negative bonus triggers validation error.

### B3. Marketplace Fee Profit Calculator
1. Baseline scenario computes expected net profit, margin, break-even price, target-margin price.
2. `price <= 0` triggers validation error.
3. Invalid target margin denominator (e.g., target too high with heavy fee stack) shows safe error.

## C. Integration / Deployment
- [ ] `tools/manifest.json` includes all 3 new slugs
- [ ] `_data/tools-list.json` includes all 3 new URLs
- [ ] All 3 production URLs respond HTTP 200
