# Spec — white-label-agency-margin-calculator

## Product intent
Deliver a static agency pricing calculator that estimates profitable monthly retainer pricing for white-label services.

## User flow
1. Enter current retainer and cost assumptions.
2. Tool validates all values and computes economics instantly.
3. User sees:
   - modeled monthly cost,
   - break-even retainer,
   - recommended retainer at target margin,
   - current margin/profit and price gap.
4. User copies a concise summary for internal pricing review or sales calls.

## Formula model
- `effectiveCostPerHour = blendedTeamCostPerHour / (teamUtilizationPct / 100)`
- `revisionHours = revisionsPerMonth * hoursPerRevision`
- `scopeCreepHours = (plannedHoursPerMonth + revisionHours) * scopeCreepPct / 100`
- `totalDeliveryHours = plannedHoursPerMonth + revisionHours + scopeCreepHours`
- `laborCost = totalDeliveryHours * effectiveCostPerHour`
- `totalMonthlyCost = laborCost + toolingCostPerMonth + managementOverheadPerMonth`
- `breakEvenRetainer = totalMonthlyCost / (1 - paymentFeePct/100)`
- `recommendedRetainer = totalMonthlyCost / (1 - paymentFeePct/100 - targetMarginPct/100)`

## Validation constraints
- All inputs must be finite numbers within configured ranges.
- `teamUtilizationPct` minimum set to 20.
- `targetMarginPct + paymentFeePct` must be `< 100`.

## Non-functional constraints
- No backend, no external deps.
- Static HTML + module scripts only.
- Pure logic module must be testable with `node --test`.
