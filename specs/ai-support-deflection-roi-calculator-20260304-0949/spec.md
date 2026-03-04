# Spec — ai-support-deflection-roi-calculator

## Product intent
Provide a decision-ready calculator for support leaders evaluating AI ticket deflection economics.

## User flow
1. Enter current support baseline and target AI deflection assumptions.
2. Tool validates ranges and computes ROI instantly.
3. User reviews net benefit, ROI, payback, and break-even deflection target.
4. User copies summary for budget or vendor review meetings.

## Core model
- `currentDeflectedTickets = monthlyTickets * currentDeflectionPct`
- `targetDeflectedTickets = monthlyTickets * targetDeflectionPct`
- `incrementalDeflectedTickets = target - current`
- `laborValuePerDeflectedTicket = (avgHandleMinutes / 60) * agentHourlyCost`
- `grossLaborSavings = incrementalDeflectedTickets * laborValuePerDeflectedTicket`
- `aiVariableCost = targetDeflectedTickets * aiCostPerDeflectedTicket`
- `totalProgramCost = aiVariableCost + implementationCostPerMonth + platformFeePerMonth + qualityReviewCostPerMonth`
- `netMonthlyBenefit = grossLaborSavings - totalProgramCost`
- `roiPct = netMonthlyBenefit / totalProgramCost * 100`
- `paybackMonths = oneTimeSetupCost / netMonthlyBenefit` when positive, else `Infinity`

## Validation constraints
- Numeric finite inputs within declared ranges.
- `targetDeflectionPct >= currentDeflectionPct`.
- Keep pure deterministic math in `logic.mjs`.

## Non-functional constraints
- Static HTML + JS modules, no backend.
- Local persistence with localStorage.
- Unit-testable logic via Node test runner.
