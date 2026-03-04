# Spec — api-credit-pack-breakage-roi-calculator

## Product intent
Help API product/finance teams decide whether a prepaid credit-pack program with expected breakage is worth launching.

## User flow
1. Enter current and target credit-pack adoption.
2. Enter per-credit revenue/cost assumptions, breakage, and reserve policy.
3. Enter support, fixed monthly ops cost, setup cost, and analysis horizon.
4. Review KPI snapshot and copy summary into internal planning docs.

## Core model
- `currentBuyers = activeCustomers * currentAdoptionRate`
- `targetBuyers = activeCustomers * targetAdoptionRate`
- `incrementalBuyers = targetBuyers - currentBuyers`
- `grossRevenuePerBuyer = avgCreditsPerBuyer * pricePerCredit`
- `consumedCreditsPerBuyer = avgCreditsPerBuyer * (1 - breakageRate)`
- `deliveryCostPerBuyer = consumedCreditsPerBuyer * deliveryCostPerCredit`
- `liabilityReservePerBuyer = grossRevenuePerBuyer * reserveRate`
- `netContributionPerBuyer = grossRevenuePerBuyer - deliveryCostPerBuyer - liabilityReservePerBuyer - supportCostPerBuyer`
- `incrementalContribution = incrementalBuyers * netContributionPerBuyer`
- `netMonthlyBenefit = incrementalContribution - monthlyProgramCost`
- `periodNetBenefit = netMonthlyBenefit * analysisMonths - oneTimeSetupCost`
- `roiPct = periodNetBenefit / oneTimeSetupCost` (if setup cost > 0)
- `paybackMonths = oneTimeSetupCost / netMonthlyBenefit` (if net monthly benefit > 0)

## Validation constraints
- finite numeric bounds for all inputs
- `targetAdoptionPct >= currentAdoptionPct`
- finite guards for break-even when unit contribution is non-positive

## Non-functional constraints
- static client-side implementation only
- responsive/mobile-friendly layout
- concise usage copy + copyable summary
