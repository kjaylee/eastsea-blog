# Spec — Teachable vs Thinkific Profit Calculator

## Summary
Side-by-side comparison calculator showing net revenue on Teachable vs Thinkific for each plan tier, given course price, monthly sales, billing cycle, and payment method.

## Inputs
- `coursePrice` (USD, > 0)
- `monthlySales` (positive integer)
- `billingCycle` ("monthly" | "annual")

## Calculation per platform per plan
- `subscription` = plan monthly or annual/mo cost
- `grossRevenue` = coursePrice × monthlySales
- `platformFee` = grossRevenue × txFeePct (Teachable) or gatewayFeePct (Thinkific)
- `processingFee` = grossRevenue × 2.9% + monthlySales × $0.30
- `totalCost` = subscription + platformFee + processingFee
- `netRevenue` = grossRevenue - totalCost
- `takeHomePerSale` = netRevenue / monthlySales
- `effectiveRate` = (totalCost / grossRevenue) × 100

## Output layout
1. Input section (top)
2. Best-match comparison card (Teachable best plan vs Thinkific best plan)
3. Full plan grid: all plans from both platforms ranked by net revenue
4. Copyable summary

## Best plan logic
Per platform, pick the plan with highest net revenue (net after subscription + all fees).

## Metadata
- Title: "Teachable vs Thinkific Profit Calculator"
- Canonical: /tools/teachable-vs-thinkific-profit-calculator/
- Schema: WebApplication
- Back link to /tools/
- Analytics: /assets/analytics.js
- Related: teachable-fee-calculator, thinkific-fee-calculator

## Done criteria
- Page at tools/teachable-vs-thinkific-profit-calculator/index.html
- Wired in _data/tools-list.json
- Wired in tools/manifest.json  
- Node --check passes
