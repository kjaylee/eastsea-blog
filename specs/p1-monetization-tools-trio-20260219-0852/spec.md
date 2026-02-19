# Spec — P1 Monetization Tools Trio (2026-02-19 08:52)

## 1) Goal
Ship 3 **new, monetizable, business ROI calculators** as single-file responsive tools under `tools/<slug>/index.html`, then publish to `https://eastsea.monster/tools/<slug>/`.

## 2) New Tool Set (non-duplicate slugs)
1. `cpq-discount-guardrail-roi-calculator`
2. `contract-redline-cycle-roi-calculator`
3. `onboarding-time-to-value-roi-calculator`

## 3) Business Value Hypothesis
- **CPQ Discount Guardrail ROI**: quantifies margin leakage recovery from discount governance.
- **Contract Redline Cycle ROI**: quantifies closed-won lift + legal productivity savings from faster contract cycles.
- **Onboarding Time-to-Value ROI**: quantifies activation/retention revenue lift + CSM workload savings.

## 4) Functional Requirements
For each tool:
- Single `index.html` only (no external build step).
- Responsive layout (mobile + desktop).
- Input validation with clear error messages.
- Real formulas with KPI outputs.
- KPI summary textarea + copy button.
- Reset button to restore defaults.

## 5) Formula Requirements

### A. CPQ Discount Guardrail ROI
Inputs:
- Monthly quotes, average list deal size, current win rate, expected win-rate change (pp)
- Current avg discount (%), target avg discount (%)
- Gross margin (%), monthly platform cost, monthly enablement cost, one-time implementation cost

Core formulas:
- `currentRevenue = quotes * winRate * avgDeal * (1 - currentDiscount)`
- `newRevenue = quotes * (winRate + winRateChange) * avgDeal * (1 - targetDiscount)`
- `currentGrossProfit = currentRevenue * grossMargin`
- `newGrossProfit = newRevenue * grossMargin`
- `monthlyProfitLift = newGrossProfit - currentGrossProfit`
- `monthlyNetImpact = monthlyProfitLift - (platformCost + enablementCost)`
- `annualNetImpact = monthlyNetImpact * 12 - implementationCost`
- `ROI% = annualNetImpact / (12*(platformCost+enablementCost)+implementationCost) * 100`
- `paybackMonths = implementationCost / monthlyNetImpact` (if monthlyNetImpact > 0)

### B. Contract Redline Cycle ROI
Inputs:
- Contracts per month, average contract value, base win rate
- Current cycle days, target cycle days
- Win-rate lift per 10-day reduction (pp)
- Hours saved per contract, legal hourly cost
- Monthly tool cost, monthly process owner hours + hourly cost, one-time implementation cost
- Gross margin (%)

Core formulas:
- `daysReduced = currentCycleDays - targetCycleDays`
- `winLift = (daysReduced / 10) * liftPer10Days`
- `newWinRate = baseWinRate + winLift`
- `additionalWonContracts = contracts * (newWinRate - baseWinRate)`
- `incrementalGrossProfit = additionalWonContracts * avgContractValue * grossMargin`
- `legalCostSavings = contracts * hoursSavedPerContract * legalHourlyCost`
- `monthlyBenefit = incrementalGrossProfit + legalCostSavings`
- `monthlyOperatingCost = toolCost + ownerHours*ownerHourlyCost`
- `monthlyNetImpact = monthlyBenefit - monthlyOperatingCost`
- `annualNetImpact = monthlyNetImpact*12 - implementationCost`
- `ROI%`, `paybackMonths` same as above logic

### C. Onboarding Time-to-Value ROI
Inputs:
- New customers/month, ARPA/month, gross margin (%)
- Current activation rate (%), target activation rate (%)
- Current 3-month retention (%), target 3-month retention (%)
- CSM hours saved per onboarded customer, CSM hourly cost
- Monthly platform cost, one-time implementation cost

Core formulas:
- `baselineQualifiedMRR = customers * activationCurrent * retentionCurrent * arpa`
- `improvedQualifiedMRR = customers * activationTarget * retentionTarget * arpa`
- `incrementalGrossProfit = (improvedQualifiedMRR - baselineQualifiedMRR) * grossMargin`
- `csmSavings = customers * activationTarget * csmHoursSaved * csmHourlyCost`
- `monthlyBenefit = incrementalGrossProfit + csmSavings`
- `monthlyNetImpact = monthlyBenefit - platformCost`
- `annualNetImpact = monthlyNetImpact*12 - implementationCost`
- `ROI%`, `paybackMonths` same logic

## 6) Discovery/Indexing Artifacts to Update
- `tools/index.html` (add cards for 3 new tools)
- `tools/manifest.json` (include 3 new entries)
- `_data/tools-list.json` (include title/description/url entries)

## 7) Verification Requirements
- Local URLs return HTTP 200 for all 3 tools.
- Live URLs return HTTP 200 for all 3 tools after push:
  - `https://eastsea.monster/tools/cpq-discount-guardrail-roi-calculator/`
  - `https://eastsea.monster/tools/contract-redline-cycle-roi-calculator/`
  - `https://eastsea.monster/tools/onboarding-time-to-value-roi-calculator/`

## 8) Done Criteria
- All 3 tool pages implemented and responsive.
- Discovery artifacts updated.
- Local + live 200 verified.
- Commit pushed to `master` in `eastsea-blog`.
- Checkpoint artifacts saved in `.state/p1-monetization-tools-trio/20260219-0852/`.
