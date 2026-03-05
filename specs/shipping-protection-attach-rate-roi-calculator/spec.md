# Spec — Shipping Protection Attach Rate ROI Calculator

## Goal
Estimate the incremental profit and ROI from increasing shipping-protection attach rate, including claims, fees, and setup costs. Provide break-even attach rate and payback timeline.

## Inputs (numeric)
- monthlyOrders
- currentAttachRatePct
- targetAttachRatePct
- protectionPrice
- claimRatePct
- avgClaimPayout
- paymentFeePct
- supportCostPerClaim
- platformFeePerOrder
- monthlyPlatformFee
- oneTimeSetupCost
- analysisMonths
- targetPaybackMonths

## Outputs
KPI cards:
- Incremental Protected Orders / Month
- Incremental Monthly Net Lift
- Period Net Benefit
- ROI %
- Payback Months
- Break-even Target Attach Rate

Driver table:
- Current Monthly Net
- Target Monthly Net
- Incremental Revenue
- Incremental Claim Cost
- Incremental Processing Fees
- Incremental Platform + Support Cost

Status:
- strong: periodNetBenefit > 0 and paybackMonths <= targetPaybackMonths
- watch: periodNetBenefit > 0 but paybackMonths > targetPaybackMonths
- risky: periodNetBenefit <= 0

## Calculations
Use model from research.md. All currency values in USD.

## UX/Copy
- Title: “Shipping Protection Attach Rate ROI Calculator”
- Short subtitle explaining attach-rate lift and claim economics.
- “Copy Summary” and “Reset Defaults” buttons.
- Summary textarea for copy/paste.

## Data Persistence
Use localStorage key: shipping_protection_attach_rate_roi_calculator_v1
