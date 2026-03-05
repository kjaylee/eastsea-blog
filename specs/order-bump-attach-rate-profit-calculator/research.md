# Research — Order Bump Attach Rate Profit Calculator

## Context
Order bumps are low-friction add-ons shown at checkout (e.g., protection, samples, accessories). Profit impact depends on attach rate lift, bump price, product/fulfillment costs, refund leakage, payment fees, and any incremental tool cost. The decision question: does increasing bump attach rate (or launching a bump) generate enough net profit to repay setup cost within a target payback window?

## Reference Inputs (from existing ROI tools)
- Tools in this repo compare baseline vs target scenarios and compute incremental monthly net, period net benefit, ROI %, and payback months.
- ROI outputs typically include a break-even target rate (minimum target attach rate that covers setup cost over the analysis period).
- UI pattern: compact two-column input grid, summary textarea, and status indicator (strong/watch/risky).

## Economics Model (Order Bump)
Let:
- `orders` = monthly orders
- `attachRate` = % of orders taking the bump
- `price` = bump price per order
- `unitCost` = cost of goods per bump
- `fulfillmentCost` = variable fulfillment cost per bump
- `refundRate` = % of bump orders refunded
- `paymentFeePct` = payment processor fee % on bump revenue
- `supportCostPerRefund`
- `monthlyToolCost` = incremental monthly tool/app cost for the bump program

Then:
- `bumpOrders = orders × attachRate`
- `grossRevenue = bumpOrders × price`
- `refundLoss = bumpOrders × refundRate × price`
- `paymentFees = grossRevenue × paymentFeePct`
- `productCost = bumpOrders × unitCost`
- `fulfillmentCost = bumpOrders × fulfillmentCost`
- `supportCost = bumpOrders × refundRate × supportCostPerRefund`
- `monthlyNet = (grossRevenue − refundLoss) − paymentFees − productCost − fulfillmentCost − supportCost − monthlyToolCost`

Baseline uses `currentAttachRate` with `monthlyToolCost = 0` (or already paid). Target uses `targetAttachRate` with the tool cost applied.
- `incrementalMonthlyNet = target.monthlyNet − current.monthlyNet`
- `periodNetBenefit = incrementalMonthlyNet × analysisMonths − oneTimeSetupCost`
- `ROI% = periodNetBenefit ÷ oneTimeSetupCost × 100`
- `paybackMonths = oneTimeSetupCost ÷ incrementalMonthlyNet` (if positive)

Break-even target attach rate is the smallest attach rate (≥ current) where `periodNetBenefit ≥ 0`.

## UX Notes
- Mobile-friendly grid, two cards layout, summary copy button.
- Status indicator: strong (payback within target), watch (positive but slow), risky (not profitable).
