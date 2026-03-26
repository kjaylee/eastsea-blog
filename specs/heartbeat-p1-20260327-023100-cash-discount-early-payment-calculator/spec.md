# Spec — cash-discount-early-payment-calculator

## Objective
Ship one new static monetization/finance tool at `tools/cash-discount-early-payment-calculator/` that helps operators estimate whether an early-payment cash-discount program creates positive unit economics.

## Primary user
- Finance, revops, and AR operators evaluating invoice-term incentives such as `1/10 net 30` or similar discounted payment offers.

## In scope
- One static tool page with extracted calculation logic in `calculator.js`.
- Deterministic unit tests in `calculator.test.js`.
- Discovery wiring in:
  - `_data/tools-list.json`
  - `tools/index.html`
  - `tools/index.md`
  - `tools/manifest.json`

## Out of scope
- Tax advice
- Multi-currency support
- Customer-level cohort simulation
- Collection waterfall / daily cashflow timeline
- Reworking the existing `early-payment-discount-apr-calculator`

## Inputs
- Monthly invoice volume
- Early-pay eligible invoice share (%)
- Projected program adoption (% of eligible volume)
- Average invoice amount
- Discount rate (%)
- Processing fee rate (% of adopted volume)
- Processing fixed fee per paid invoice
- Current payment terms (days)
- Early-pay terms (days)
- Annual cost of capital (%)
- Baseline bad-debt rate on adopted volume (%)
- Bad-debt reduction from early-pay program (%)
- Monthly ops savings
- Monthly program cost
- One-time setup cost
- Analysis period (months)

## Outputs
- Early-pay eligible volume
- Adopted early-pay volume
- Estimated participating invoice count
- Discount cost
- Processing fees
- Financing benefit from earlier cash collection
- Bad-debt savings
- Gross monthly benefit
- Monthly net impact
- Period net impact after setup cost
- ROI
- Payback months
- Break-even adoption rate

## Core formulas
- `eligibleVolume = monthlyInvoiceVolume * eligibleShare`
- `adoptedVolume = eligibleVolume * projectedAdoption`
- `participatingInvoiceCount = adoptedVolume / averageInvoiceAmount`
- `discountCost = adoptedVolume * discountRate`
- `processingFees = adoptedVolume * processingFeeRate + participatingInvoiceCount * processingFixedFee`
- `daysAccelerated = currentTermsDays - earlyPayTermsDays`
- `financingBenefit = adoptedVolume * annualCostOfCapital * daysAccelerated / 365`
- `badDebtSavings = adoptedVolume * badDebtRate * badDebtReduction`
- `grossBenefit = financingBenefit + badDebtSavings + opsSavings`
- `monthlyNetImpact = grossBenefit - discountCost - processingFees - monthlyProgramCost`
- `periodNetImpact = monthlyNetImpact * months - setupCost`
- `totalProgramCost = (discountCost + processingFees + monthlyProgramCost) * months + setupCost`
- `roiPct = periodNetImpact / totalProgramCost * 100`
- `paybackMonths = setupCost / monthlyNetImpact` when `monthlyNetImpact > 0`, else no payback
- `breakEvenAdoptionPct = (monthlyProgramCost - opsSavings) / (eligibleVolume * contributionPerAdoptedDollar) * 100`
- `contributionPerAdoptedDollar = annualCostOfCapital * daysAccelerated / 365 + badDebtRate * badDebtReduction - discountRate - processingFeeRate - processingFixedFee / averageInvoiceAmount`

## UX requirements
- Mobile-safe two-column layout collapsing to one column on smaller screens.
- Prominent KPI grid first; details and summary below.
- Clear note that the page models seller-side ROI, not legal/accounting advice.
- Short cross-link note pointing users to the APR-focused sibling tool when they specifically need implied APR framing.
- Bilingual-friendly copy with English/Korean headings and summary support.

## Acceptance criteria
- `tools/cash-discount-early-payment-calculator/index.html` exists and loads `calculator.js`.
- `node --check` passes for `calculator.js`.
- `node --test` passes for `calculator.test.js`.
- Discovery exact-once checks pass for the slug/url in `_data/tools-list.json`, `tools/index.html`, `tools/index.md`, and `tools/manifest.json`.

