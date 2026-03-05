# Spec — Order Bump Attach Rate Profit Calculator

## Goal
Estimate incremental profit and ROI from improving order-bump attach rate at checkout, factoring refund leakage, variable costs, payment fees, and setup cost. Provide break-even attach rate and payback timeline.

## Inputs (numeric)
- monthlyOrders
- currentAttachRatePct
- targetAttachRatePct
- bumpPrice
- bumpUnitCost
- fulfillmentCostPerBump
- refundRatePct
- paymentFeePct
- supportCostPerRefund
- monthlyToolCost
- oneTimeSetupCost
- analysisMonths
- targetPaybackMonths

## Outputs
KPI cards:
- Incremental Bump Orders / Month
- Incremental Monthly Net Lift
- Period Net Benefit
- ROI %
- Payback Months
- Break-even Target Attach Rate

Driver table:
- Current Monthly Net
- Target Monthly Net
- Incremental Gross Revenue
- Incremental Refund Loss
- Incremental COGS + Fulfillment
- Incremental Processing + Support + Tool Cost

Status:
- strong: periodNetBenefit > 0 and paybackMonths <= targetPaybackMonths
- watch: periodNetBenefit > 0 but paybackMonths > targetPaybackMonths
- risky: periodNetBenefit <= 0

## Calculations
Use model from research.md. All currency values in USD. Target scenario includes monthlyToolCost; baseline does not.

## UX/Copy
- Title: “Order Bump Attach Rate Profit Calculator”.
- Subtitle explaining attach-rate lift and cost stack (COGS, fulfillment, refunds, fees).
- “Copy Summary” and “Reset Defaults” buttons.
- Summary textarea for copy/paste.

## Data Persistence
Use localStorage key: order_bump_attach_rate_profit_calculator_v1
