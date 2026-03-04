# Spec — premium-support-attach-rate-roi-calculator

## Product intent
Help B2B SaaS operators evaluate whether premium support attach-rate expansion is financially worth shipping.

## User flow
1. Input active accounts and current/target attach rate.
2. Input plan economics (price, gross margin, delivery cost) plus retention effect and fixed costs.
3. Review KPI panel (monthly net, ROI, payback, break-even attach).
4. Copy summary block into internal planning docs.

## Core model
- `currentAttached = activeAccounts * currentAttachRate`
- `targetAttached = activeAccounts * targetAttachRate`
- `incrementalAttached = targetAttached - currentAttached`
- `addOnGrossProfitPerAccount = price * grossMargin - deliveryCost`
- `incrementalAddOnGrossProfit = incrementalAttached * addOnGrossProfitPerAccount`
- `savedAccountsPerMonth = targetAttached * churnReductionRate`
- `retentionGrossProfit = savedAccountsPerMonth * avgAccountGrossProfitPerMonth`
- `totalIncrementalGrossProfit = incrementalAddOnGrossProfit + retentionGrossProfit`
- `netMonthlyBenefit = totalIncrementalGrossProfit - fixedProgramCost`
- `periodNetBenefit = netMonthlyBenefit * analysisMonths - oneTimeSetupCost`
- `roiPct = periodNetBenefit / oneTimeSetupCost`
- `paybackMonths = oneTimeSetupCost / netMonthlyBenefit` (when positive)

## Validation constraints
- finite numeric inputs within declared ranges
- `targetAttachPct >= currentAttachPct`
- guard break-even calculation when denominator <= 0

## Non-functional constraints
- static client-side implementation only
- mobile-friendly responsive layout
- summary copy block for board/internal sharing
