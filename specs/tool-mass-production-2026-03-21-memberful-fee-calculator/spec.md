# Spec — Memberful Fee Calculator

## Slug
`memberful-fee-calculator`

## Title
Memberful Fee Calculator | 멤버풀 수수료 계산기

## Primary user
Creators and membership operators estimating real monthly Memberful take-home after Memberful fees, Stripe processing, refunds, and other fixed costs.

## Scope
Build a static calculator that:
1. Computes monthly take-home and net profit for Memberful’s public standard pricing.
2. Compares processor scenarios: Stripe domestic, Stripe international, and custom.
3. Surfaces break-even monthly gross sales and target-net required gross sales.
4. Works fully client-side with deterministic tests.

## Inputs
- Monthly gross sales
- Successful charges count
- Refund rate (%)
- Stripe processor preset: domestic / international / custom
- Custom processor rate (%)
- Custom processor flat fee
- Other monthly fixed cost
- Desired monthly net profit

## Outputs
- Memberful monthly platform fee
- Memberful transaction fee total
- Stripe processing fee total
- Refund loss
- Take-home after platform costs
- Net profit
- Annualized net profit
- Average successful charge amount
- Effective fee rate
- Break-even monthly gross sales
- Required monthly gross sales for desired net profit
- Current gap vs target gross sales
- Processor comparison table
- Copyable summary block

## Math
Definitions:
- `gross = monthlyGrossSales`
- `charges = successfulCharges`
- `refundLoss = gross * refundRate`
- `memberfulFixedFee = 49`
- `memberfulTransactionFees = gross * 0.049`
- `processorFees = gross * processorRate + charges * processorFlat`
- `takeHomeAfterPlatform = gross - refundLoss - memberfulFixedFee - memberfulTransactionFees - processorFees`
- `netProfit = takeHomeAfterPlatform - otherMonthlyCost`
- `annualizedNetProfit = netProfit * 12`
- `averageChargeAmount = gross / charges`
- `effectiveFeeRate = (memberfulFixedFee + memberfulTransactionFees + processorFees) / gross`

Contribution margin model for break-even / target gross:
- `avgChargeAmount = gross / charges`
- `flatFeeRate = processorFlat / avgChargeAmount`
- `contributionMarginRate = 1 - refundRate - 0.049 - processorRate - flatFeeRate`
- `breakEvenGross = (49 + otherMonthlyCost) / contributionMarginRate`
- `targetGross = (49 + otherMonthlyCost + desiredMonthlyNetProfit) / contributionMarginRate`
- Return `null` if `charges <= 0`, `gross <= 0`, `avgChargeAmount <= 0`, or `contributionMarginRate <= 0`.
- `targetGap = max(targetGross - gross, 0)`

Processor presets:
- Domestic cards: `2.9% + $0.30`
- International cards: `4.4% + $0.30` (2.9% + 1.5% surcharge)
- Custom: user-supplied rate and flat fee

## UX requirements
- Responsive single-page layout.
- Bilingual labels (KO/EN toggle).
- Explicit note that Stripe fees vary by country and the presets are public baseline defaults.
- Clear note that break-even math assumes current average charge amount stays constant.
- Copyable summary block.
- Back link to `/tools/`.

## SEO/meta
- Title includes “Memberful Fee Calculator”.
- Description mentions $49/month, 4.9% Memberful fee, Stripe processing, and break-even gross sales.
- Canonical set to `/tools/memberful-fee-calculator/`.

## Deliverables
- `tools/memberful-fee-calculator/index.html`
- `tools/memberful-fee-calculator/calculator.js`
- `tools/memberful-fee-calculator/calculator.test.js`
- `_data/tools-list.json` entry
- `tools/index.html` card
- `tools/index.md` list entry
- `tools/manifest.json` rebuild
