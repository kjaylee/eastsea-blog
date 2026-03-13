# Spec — chargeback-representment-roi-calculator

## Product intent
Deliver a static calculator that quantifies whether improving chargeback representment performance generates positive monthly ROI after labor, software, and vendor fees.

## User flow
1. User enters dispute volume, order economics, current vs projected win rate, and operating costs.
2. Tool validates all values instantly.
3. Tool renders KPI outputs and a driver table without page reload.
4. User can copy a concise business summary for internal approval or vendor evaluation.
5. User can reset to defaults and compare scenarios quickly.

## Functional requirements
- Render default scenario on first load.
- Persist last-used inputs in localStorage.
- Show KPI cards for current recovery, projected recovery, incremental recovery, total cost, net lift, ROI, break-even lift, and payback.
- Show cost-driver detail rows for wins, recovered value per win, labor cost, variable fees, and fixed platform cost.
- Provide copy-summary and reset buttons.
- Surface clear validation messages for impossible or out-of-range inputs.

## Formula model
- `currentWinRate = currentWinRatePct / 100`
- `projectedWinRate = projectedWinRatePct / 100`
- `grossValuePerWin = averageOrderValue + chargebackFeePerCase`
- `currentWins = disputedOrdersPerMonth * currentWinRate`
- `projectedWins = disputedOrdersPerMonth * projectedWinRate`
- `incrementalWins = projectedWins - currentWins`
- `currentRecoveredRevenue = currentWins * grossValuePerWin`
- `projectedRecoveredRevenue = projectedWins * grossValuePerWin`
- `incrementalRecoveredRevenue = incrementalWins * grossValuePerWin`
- `evidenceCost = projectedWins * evidencePrepCostPerCase`
- `vendorFeeCost = incrementalRecoveredRevenue * vendorFeePct / 100`
- `platformFeeCost = incrementalRecoveredRevenue * platformFeePct / 100`
- `laborCost = analystHoursPerMonth * analystHourlyCost`
- `fixedCost = monthlySoftwareCost + laborCost`
- `totalProgramCost = evidenceCost + vendorFeeCost + platformFeeCost + fixedCost`
- `netLift = incrementalRecoveredRevenue - totalProgramCost`
- `roiPct = netLift / totalProgramCost * 100`
- `breakEvenIncrementalRecoveredRevenue = fixedCost / (1 - vendorFeePct/100 - platformFeePct/100) + evidenceCost`
- `breakEvenProjectedWinRatePct = ((currentRecoveredRevenue + breakEvenIncrementalRecoveredRevenue) / grossValuePerWin) / disputedOrdersPerMonth * 100`
- `paybackMonths = totalProgramCost > 0 && netLift > 0 ? totalProgramCost / netLift : Infinity`

## Validation constraints
- All inputs must be finite numbers in bounded ranges.
- `disputedOrdersPerMonth >= 1`
- `averageOrderValue > 0`
- `chargebackFeePerCase >= 0`
- `0 <= currentWinRatePct <= 100`
- `currentWinRatePct <= projectedWinRatePct <= 100`
- `vendorFeePct + platformFeePct < 100`
- cost fields cannot be negative.

## Non-functional constraints
- Static HTML + JS only, no backend.
- Logic must live in a testable module.
- Unit tests must run with `node --test`.
- Manifest rebuild and manifest test must pass before commit.
