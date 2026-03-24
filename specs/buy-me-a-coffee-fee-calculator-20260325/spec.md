# Spec — Buy Me a Coffee Fee Calculator

## Slug
`buy-me-a-coffee-fee-calculator`

## Title
Buy Me a Coffee Fee Calculator | 바이미어커피 수수료 계산기

## Primary user
Creators estimating actual monthly Buy Me a Coffee take-home after platform fee, Stripe card processing, payout drag, reward fulfillment cost, and fixed monthly overhead.

## Problem statement
Creators looking at Buy Me a Coffee do not care only about the headline 5% fee. They need to know:
- what they actually keep each month
- how much the optional “supporter covers card fee” setting changes take-home
- what average support amount is required to break even or hit a target monthly net

## Scope
Build one static, client-only calculator under `tools/buy-me-a-coffee-fee-calculator/` that:
1. estimates creator take-home for monthly support volume
2. supports the official default fee assumptions but keeps them editable
3. compares creator-covered card fees vs supporter-covered card fees
4. exposes break-even and target average support amount math
5. works offline in the browser with deterministic test coverage

## Existing catalog state to preserve
Current repo already contains this slug in discovery surfaces:
- `tools/index.html` — exactly one card
- `tools/index.md` — exactly one list item
- `_data/tools-list.json` — exactly one URL entry

Current repo does **not** contain:
- `tools/buy-me-a-coffee-fee-calculator/`
- `tools/manifest.json` entry for this slug

Implementation must avoid duplicating the existing discovery entries. The implementation run should preserve exact-once mentions and only add the actual tool files plus manifest entry.

## Inputs
- `transactionCount` — integer, `>= 0`
- `averageSupportAmount` — currency, `>= 0`
- `coverCardFeeFromSupporters` — boolean
- `platformFeeRatePct` — default `5`, editable
- `processingRatePct` — default `2.9`, editable
- `processingFixedFee` — default `0.30`, editable
- `payoutRatePct` — default `0.5`, editable
- `rewardCostPerTransaction` — default `0`, editable
- `otherMonthlyCost` — default `0`, editable
- `desiredMonthlyNetProfit` — default `0`, editable
- `currency` — formatting only, default `USD`
- `lang` — `en` / `ko`

## Validation
- money values must be finite and `>= 0`
- percentage values must be finite and `>= 0` and `< 100`
- `transactionCount` must be an integer and `>= 0`
- if `transactionCount === 0`, break-even and target average support outputs return `null`
- if a denominator for break-even math is `<= 0`, return `null`

## Outputs
### KPI outputs
- creator-priced gross support volume
- actual supporter charge total
- total platform fees
- total card processing fees
- total payout fees
- total reward / fulfillment cost
- take-home before operating costs
- monthly net profit
- effective creator fee drag (%)
- break-even average support amount
- required average support amount for target monthly net
- net-profit delta vs alternate fee-coverage setting

### Detail outputs
- current scenario label (`creator covers card fee` or `supporter covers card fee`)
- alternate scenario label
- alternate scenario monthly net profit
- extra amount supporters pay when fee pass-through is enabled
- per-transaction take-home after all modeled costs
- copyable summary text block

## Math
Use decimal math in JS number space, rounded for display only.

### Shared definitions
- `count = transactionCount`
- `avg = averageSupportAmount`
- `gross = count * avg`
- `platformRate = platformFeeRatePct / 100`
- `processingRate = processingRatePct / 100`
- `payoutRate = payoutRatePct / 100`
- `rewardCosts = count * rewardCostPerTransaction`

### Scenario A — creator covers card fee
- `supporterChargeTotal = gross`
- `platformFees = gross * platformRate`
- `processingFees = gross * processingRate + count * processingFixedFee`
- `prePayoutTakeHome = gross - platformFees - processingFees`
- `payoutFees = prePayoutTakeHome * payoutRate`
- `takeHomeBeforeOperatingCosts = prePayoutTakeHome - payoutFees`
- `monthlyNetProfit = takeHomeBeforeOperatingCosts - rewardCosts - otherMonthlyCost`

### Scenario B — supporter covers card fee
Reverse-price the supporter total so card processing preserves the creator’s intended support amount.

- `supporterChargeTotal = (gross + count * processingFixedFee) / (1 - processingRate)`
- `processingFees = supporterChargeTotal * processingRate + count * processingFixedFee`
- creator receives `gross` after card processing
- `platformFees = gross * platformRate`
- `prePayoutTakeHome = gross - platformFees`
- `payoutFees = prePayoutTakeHome * payoutRate`
- `takeHomeBeforeOperatingCosts = prePayoutTakeHome - payoutFees`
- `monthlyNetProfit = takeHomeBeforeOperatingCosts - rewardCosts - otherMonthlyCost`

### Effective creator fee drag
For the currently selected scenario:
- `effectiveCreatorFeeDragPct = gross > 0 ? ((gross - takeHomeBeforeOperatingCosts) / gross) * 100 : 0`

This intentionally focuses on drag against the creator’s intended support volume, not total supporter spend.

### Break-even average support amount
With transaction count held constant:

If creator covers card fee:
- denominator = `count * (1 - platformRate - processingRate) * (1 - payoutRate)`
- numerator = `otherMonthlyCost + rewardCosts + count * processingFixedFee * (1 - payoutRate)`
- `breakEvenAverageSupport = numerator / denominator`

If supporter covers card fee:
- denominator = `count * (1 - platformRate) * (1 - payoutRate)`
- numerator = `otherMonthlyCost + rewardCosts`
- `breakEvenAverageSupport = numerator / denominator`

If denominator `<= 0` or `count === 0`, return `null`.

### Target average support amount
Replace the numerator above with:
- `desiredMonthlyNetProfit + otherMonthlyCost + rewardCosts + ...`

More explicitly:

If creator covers card fee:
- numerator = `desiredMonthlyNetProfit + otherMonthlyCost + rewardCosts + count * processingFixedFee * (1 - payoutRate)`

If supporter covers card fee:
- numerator = `desiredMonthlyNetProfit + otherMonthlyCost + rewardCosts`

If denominator `<= 0` or `count === 0`, return `null`.

### Alternate scenario delta
- run both scenarios from the same input set
- `netProfitDeltaVsAlternate = currentScenario.monthlyNetProfit - alternateScenario.monthlyNetProfit`

## UX requirements
- single responsive page
- bilingual EN/KR labels and summary text
- prominent scenario toggle for who covers card fees
- two-column desktop / one-column mobile layout
- KPI cards first, detailed table second
- small comparison panel showing current vs alternate scenario
- copyable summary textarea/button
- disclaimer that platform / processor fees can change and should be verified against official docs
- back link to `/tools/`

## Accessibility requirements
- all inputs have visible labels
- keyboard navigable controls
- minimum color contrast equivalent to current EastSea tool patterns
- summary copy action usable without pointer-only interactions

## SEO / metadata
- title must include `Buy Me a Coffee Fee Calculator`
- description should mention 5% platform fee, Stripe 2.9% + $0.30, 0.5% payout processing, and supporter-covered card fee option
- canonical URL: `/tools/buy-me-a-coffee-fee-calculator/`
- Open Graph / Twitter metadata aligned to title + description

## Deliverables for implementation run
Required new files:
- `tools/buy-me-a-coffee-fee-calculator/index.html`
- `tools/buy-me-a-coffee-fee-calculator/calculator.js`
- `tools/buy-me-a-coffee-fee-calculator/calculator.test.js`

Required supporting change:
- rebuild `tools/manifest.json` so the slug appears exactly once

Required preservation checks:
- `tools/index.html` still contains the slug exactly once
- `tools/index.md` still contains the slug exactly once
- `_data/tools-list.json` still contains the URL exactly once

## Non-goals
- modeling taxes / VAT / GST collection logic
- payout calendar simulation
- PayPal-specific processing paths
- multi-currency settlement differences
- subscription churn forecasting
- merch inventory / shipping logistics beyond a simple per-transaction reward cost

## Definition of ready for implementation
This spec is ready when:
- official fee assumptions are documented in `research.md`
- implementation steps are captured in `plan.md`
- failure modes are captured in `red-team.md`
- deterministic examples are captured in `test-cases.md`

That condition is satisfied by this spec package.