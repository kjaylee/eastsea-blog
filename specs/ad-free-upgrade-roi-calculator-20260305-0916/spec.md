# Spec — ad-free-upgrade-roi-calculator

## Product intent
Help app/game teams estimate whether an ad-free upgrade tier increases monthly profit after accounting for lost ad revenue, platform fees, and program costs.

## User flow
1. Enter MAU, ad-exposed share, and current ad ARPU.
2. Enter ad-free price, expected attach rate, and platform fee.
3. Add service cost per subscriber, monthly program cost, one-time setup cost, and analysis horizon.
4. Review KPI snapshot and copy the summary into pricing docs.

## Core model
- `adExposedUsers = mau * adExposureRate`
- `adFreeSubscribers = adExposedUsers * attachRate`
- `netSubscriptionPrice = adFreePrice * (1 - platformFeeRate)`
- `netContributionPerSubscriber = netSubscriptionPrice - adRevenuePerUser - serviceCostPerSubscriber`
- `grossSubscriptionRevenue = adFreeSubscribers * netSubscriptionPrice`
- `lostAdRevenue = adFreeSubscribers * adRevenuePerUser`
- `serviceCost = adFreeSubscribers * serviceCostPerSubscriber`
- `netMonthlyBenefit = grossSubscriptionRevenue - lostAdRevenue - serviceCost - monthlyProgramCost`
- `periodNetBenefit = netMonthlyBenefit * analysisMonths - oneTimeSetupCost`
- `roiPct = periodNetBenefit / oneTimeSetupCost` (if setup cost > 0)
- `paybackMonths = oneTimeSetupCost / netMonthlyBenefit` (if netMonthlyBenefit > 0)
- `breakEvenAttachRatePct = monthlyProgramCost / (adExposedUsers * netContributionPerSubscriber)` (if contribution > 0)

## Validation constraints
- all inputs must be finite numbers within reasonable bounds
- percent inputs limited to 0–100
- `analysisMonths >= 1`
- break-even attach rate only computed when `netContributionPerSubscriber > 0` and `adExposedUsers > 0`

## Non-functional constraints
- static client-side only
- mobile-friendly layout (single column under 920px)
- concise copy and copyable summary
