# Research — chargeback-representment-roi-calculator

## Goal
Ship one monetizable static web tool that helps merchants decide whether an in-house or vendor-assisted chargeback representment program pays for itself.

## Why this is a good P1 tool
- Chargebacks are high-intent and monetizable; operators already spend on dispute tooling, managed recovery, and fraud stacks.
- Users need fast scenario math before buying representment software or agencies.
- This fits EastSea's existing calculator lane: direct business value, clear lead magnet potential, and deterministic formulas.

## Existing repo patterns reviewed
1. `tools/white-label-agency-margin-calculator/`
   - Pattern: pure `logic.mjs`, thin `app.mjs`, static `index.html`, localStorage persistence, copyable summary.
   - Reuse: KPI cards + validation + status banner.
2. `tools/llm-api-margin-calculator/logic.mjs`
   - Pattern: exported `DEFAULT_INPUT`, `validateInputs`, calculator function, `buildSummary`.
   - Reuse: deterministic logic contract for unit tests.
3. `tests/unit/white-label-agency-margin-calculator.test.mjs`
   - Pattern: Node built-in test runner, behavior/monotonic assertions, summary-content checks.
   - Reuse: unit-test structure.
4. `scripts/build-manifests.sh` + `tests/unit/test-manifest.mjs`
   - Pattern: every shipped tool must expose `index.html` and be captured in `tools/manifest.json`.
   - Reuse: manifest rebuild + repo-wide validation.

## Existing tool gap check
Searched current `tools/` slugs for dispute/representment/recovery variants. Existing repo covers chargeback loss impact and reserve/cashflow tools, but no dedicated representment ROI / dispute recovery calculator exists.

## Proposed product scope
Route: `/tools/chargeback-representment-roi-calculator/`

Inputs:
- disputed orders per month
- average order value
- chargeback fee per case
- current win rate
- projected win rate after new process/vendor
- evidence prep cost per case
- vendor fee on recovered revenue
- platform fee on recovered revenue
- monthly software cost
- monthly analyst hours
- analyst loaded hourly cost

Outputs:
- current recovered revenue
- projected recovered revenue
- incremental recovered revenue
- gross avoided chargeback losses
- total program cost
- net monthly ROI
- ROI percentage
- break-even win rate improvement
- payback period in months

## Formula direction
For each won dispute, merchant recovers order value and avoids/recovers chargeback fee exposure. Use a simple model:
- `grossValuePerWin = averageOrderValue + chargebackFeePerCase`
- `currentWins = disputedOrdersPerMonth * currentWinRate`
- `projectedWins = disputedOrdersPerMonth * projectedWinRate`
- `incrementalWins = projectedWins - currentWins`
- `incrementalRecoveredRevenue = incrementalWins * grossValuePerWin`
- `variableCost = projectedWins * evidencePrepCostPerCase + incrementalRecoveredRevenue * vendorFeeRate + incrementalRecoveredRevenue * platformFeeRate`
- `fixedCost = monthlySoftwareCost + analystHoursPerMonth * analystHourlyCost`
- `netLift = incrementalRecoveredRevenue - variableCost - fixedCost`
- `roiPct = netLift / (variableCost + fixedCost) * 100`
- `breakEvenIncrementalWins = (variableCost + fixedCost) / grossValuePerWin` with vendor/platform fees treated in the denominator where appropriate

## Risks and mitigations
- Risk: impossible scenarios where projected win rate < current win rate.
  - Mitigation: explicit validation requiring projected win rate >= current win rate.
- Risk: ambiguous treatment of vendor fees.
  - Mitigation: model vendor/platform fees only on recovered value, and explain assumptions in UI copy.
- Risk: misleading ROI when total cost is zero.
  - Mitigation: guard division and show `∞` payback only when appropriate.
