# Spec — MSP Pricing Calculator

## Slug
`msp-pricing-calculator`

## Title
MSP Pricing Calculator | Managed Service Pricing Tool

## Primary user
Managed service providers, MSP operators, and sales leads who need a fast pricing model for monthly managed IT contracts.

## Task boundary
This task produces artifact docs only. No implementation is part of this task.

## Problem
EastSea already has generic service-margin and retainer tools, but not a page tailored to the exact pricing question MSP teams ask:

`What should I charge per month for this managed service contract if I want to cover labor, stack cost, onboarding, and target margin?`

That is a different intent from general agency pricing or creator fee take-home pages.

## Scope
Future implementation should build one static calculator that:
1. Estimates monthly delivery cost for an MSP agreement.
2. Calculates break-even monthly MRR.
3. Calculates recommended monthly MRR at a target margin.
4. Estimates a one-time onboarding fee.
5. Shows effective price per user and contract value.
6. Solves for break-even managed user count when a current per-user quote is supplied.
7. Runs fully client-side with deterministic tests.

## Inputs
- Current quoted monthly price, optional
- Managed users
- Managed endpoints
- Servers / critical devices
- Included support hours per month
- Reactive ticket hours per month
- Onsite hours per month
- vCIO / account-management hours per month
- Technician loaded cost per hour
- Senior strategy cost per hour
- Per-user tool stack cost per month
- Per-endpoint tool stack cost per month
- Fixed vendor/platform cost per month
- After-hours incident hours per month
- After-hours labor multiplier
- Travel / onsite expense per month
- Payment fee rate (%)
- Target operating margin (%)
- Onboarding hours
- Implementation cost per hour

## Outputs
- Variable monthly cost
- Fixed monthly cost
- Total monthly delivery cost
- Break-even monthly MRR
- Recommended monthly MRR
- Effective price per user
- Gross margin at current quoted price, if provided
- Suggested onboarding fee
- Estimated 12-month contract value
- Break-even managed user count
- Copyable summary block

## Formula direction
Future implementation should keep the model transparent:

- `variableLaborCost = (includedSupportHours + reactiveTicketHours) * technicianLoadedCostPerHour`
- `afterHoursCost = afterHoursIncidentHours * technicianLoadedCostPerHour * afterHoursMultiplier`
- `onsiteCost = onsiteHours * technicianLoadedCostPerHour + travelExpensePerMonth`
- `strategyCost = vcioHours * seniorStrategyCostPerHour`
- `perUserStackCost = managedUsers * toolStackCostPerUser`
- `perEndpointStackCost = managedEndpoints * toolStackCostPerEndpoint`
- `fixedMonthlyCost = fixedVendorCostPerMonth + strategyCost + onsiteCost`
- `variableMonthlyCost = variableLaborCost + afterHoursCost + perUserStackCost + perEndpointStackCost`
- `monthlyDeliveryCost = fixedMonthlyCost + variableMonthlyCost`
- `breakEvenMonthlyMRR = monthlyDeliveryCost / (1 - paymentFeeRate)`
- `recommendedMonthlyMRR = monthlyDeliveryCost / (1 - paymentFeeRate - targetMarginRate)`
- `onboardingFee = (onboardingHours * implementationCostPerHour) / (1 - paymentFeeRate - targetMarginRate)`
- `effectivePricePerUser = managedUsers > 0 ? recommendedMonthlyMRR / managedUsers : null`
- `grossMarginAtCurrentQuote = currentQuotedMonthlyPrice > 0 ? (currentQuotedMonthlyPrice - currentQuotedMonthlyPrice * paymentFeeRate - monthlyDeliveryCost) / currentQuotedMonthlyPrice : null`
- `contractValue12Months = recommendedMonthlyMRR * 12 + onboardingFee`

Break-even user solver for a supplied current quote:
- `quoteNetAfterFees = currentQuotedMonthlyPrice * (1 - paymentFeeRate)`
- `fixedCostExcludingPerUser = monthlyDeliveryCost - perUserStackCost`
- `breakEvenManagedUsers = perUserUnitContribution > 0 ? fixedCostExcludingPerUser / perUserUnitContribution : null`

Implementation notes:
- `perUserUnitContribution` must be defined explicitly in code from the quote model being used.
- Reverse-solver outputs return `null` when the denominator is non-positive.
- Visible currency values should round consistently to cents.

## UX requirements
- Responsive single-page calculator
- KPI block above the fold
- Clear separation between monthly recurring price and one-time onboarding fee
- Visible assumptions note that this is a planning model, not a market-price benchmark
- Copyable summary aimed at quote review or internal approval
- Related links to adjacent B2B pricing tools already shipped in EastSea

## SEO/meta requirements
- Title contains `MSP Pricing Calculator`
- Description includes MSP pricing, managed service pricing, monthly contract, and margin language
- Canonical points to `/tools/msp-pricing-calculator/`
- Related links should prefer nearby B2B/service tools:
  - `white-label-agency-margin-calculator`
  - `professional-services-utilization-margin-calculator`
  - `ai-retainer-profit-planner`
  - `fractional-cmo-pricing-calculator`

## Non-goals
- No implementation in this task
- No geographic market-rate benchmarking in v1
- No tax or accounting advice
- No hardware resale margin modeling in v1
- No procurement, licensing true-up, or procurement financing engine
- No multi-client portfolio planner

## Deliverables for a future implementation task
- `tools/msp-pricing-calculator/index.html`
- `tools/msp-pricing-calculator/calculator.js`
- `tools/msp-pricing-calculator/calculator.test.js`
- discovery wiring updates only when the tool actually ships
