# Research — Shipping Protection Attach Rate ROI Calculator

## Context
Shipping protection (or shipping insurance) is a checkout add-on priced per order. Revenue is proportional to protected orders, while costs are driven by claims (rate × average payout), payment processing fees, support handling costs, and any per-order platform fee plus a monthly vendor fee. The ROI question is whether pushing the attach rate up (or launching the add-on) produces enough net profit to cover setup cost within a target payback window.

## Reference Inputs (from existing tool patterns)
- Tools in this repo model ROI by comparing a current baseline vs. target scenario, then compute incremental revenue/cost, payback, ROI, and a break-even target value.
- Typical ROI outputs in the repo:
  - Incremental monthly net lift
  - Period net benefit (after setup)
  - ROI %
  - Payback months
  - Break-even target rate

## Economics Model (for shipping protection)
Let:
- `orders` = monthly orders
- `attachRate` = % of orders purchasing protection
- `price` = protection price per order
- `claimRate` = % of protected orders that claim
- `avgPayout` = average payout per claim
- `paymentFeePct` = payment processor fee % on protection revenue
- `supportCostPerClaim`
- `platformFeePerOrder` = vendor fee per protected order
- `monthlyPlatformFee` = fixed monthly vendor fee

Then:
- `protectedOrders = orders × attachRate`
- `revenue = protectedOrders × price`
- `paymentFees = revenue × paymentFeePct`
- `claimCost = protectedOrders × claimRate × avgPayout`
- `supportCost = protectedOrders × claimRate × supportCostPerClaim`
- `platformVariable = protectedOrders × platformFeePerOrder`
- `monthlyNet = revenue − paymentFees − claimCost − supportCost − platformVariable − monthlyPlatformFee`

Baseline uses `currentAttachRate`; target uses `targetAttachRate`.
- `incrementalMonthlyNet = target.monthlyNet − current.monthlyNet`
- `periodNetBenefit = incrementalMonthlyNet × analysisMonths − oneTimeSetupCost`
- `ROI% = periodNetBenefit ÷ oneTimeSetupCost × 100`
- `paybackMonths = oneTimeSetupCost ÷ incrementalMonthlyNet` (if positive)

Break-even target attach rate is the smallest attach rate (≥ current) where `periodNetBenefit ≥ 0`.

## UX Notes
- Compact, mobile-friendly input grid.
- Copy summary and reset defaults, consistent with other ROI tools.
- Status indicator: strong (payback within target), watch (profitable but slower), risky (not profitable).
