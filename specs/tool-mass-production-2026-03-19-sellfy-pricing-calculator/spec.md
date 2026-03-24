# Spec — Sellfy Pricing Calculator

## Slug
`sellfy-pricing-calculator`

## Title
Sellfy Pricing Calculator | 셀피 요금제 수익 계산기

## Primary user
Creators and digital sellers estimating real Sellfy take-home after plan cost, processor fees, refunds, and overage.

## Scope
Build a static calculator that:
1. Computes annual take-home and net profit for one selected Sellfy plan.
2. Compares Starter / Business / Premium under the same assumptions.
3. Surfaces overage risk and upgrade break-even revenue.
4. Works fully client-side with deterministic tests.

## Inputs
- Sellfy plan: Starter / Business / Premium
- Billing cycle: monthly / annual
- Annual gross sales
- Orders per year
- Refund rate (%)
- Delivery or COGS per order
- Other annual fixed cost
- Processor preset: Stripe / PayPal US / PayPal Intl / Custom
- Custom processor rate (%)
- Custom processor flat fee

## Outputs
- Annual subscription cost
- Annual processor fee total
- Annual refund loss
- Annual Sellfy overage fee
- Take-home after platform costs
- Net profit
- Monthly net profit
- Average order value
- Effective Sellfy cost rate
- Effective processor cost rate
- Cap headroom or over-cap amount
- Break-even annual gross sales
- Next-plan upgrade break-even annual sales
- Cost-based recommended plan in comparison table

## Math
Definitions:
- `gross = annualGrossSales`
- `refundLoss = gross * refundRate`
- `processorFees = gross * processorRate + orders * processorFlat`
- `subscriptionCost = plan annual cost by billing cycle`
- `overageFee = max(gross - planCap, 0) * 0.02`
- `deliveryCostTotal = orders * deliveryCostPerOrder`
- `takeHomeAfterPlatform = gross - refundLoss - processorFees - subscriptionCost - overageFee`
- `netProfit = takeHomeAfterPlatform - deliveryCostTotal - otherAnnualCost`
- `monthlyNetProfit = netProfit / 12`
- `averageOrderValue = gross / orders`
- `effectiveSellfyCostRate = (subscriptionCost + overageFee) / gross`
- `effectiveProcessorCostRate = processorFees / gross`

Break-even gross sales:
- Piecewise solution with and without overage.
- Use fixed order count and current processor inputs.
- Return `null` if denominator is non-positive.

Next-plan break-even sales:
- If next plan exists:
  - `cap + (nextPlanSubscriptionCost - currentPlanSubscriptionCost) / 0.02`
- If no next plan, return `null`.

## UX requirements
- Responsive single-page layout.
- Copyable summary block.
- Bilingual labels (KO/EN toggle).
- Clear note that recommendation is cost-based only and does not model feature requirements.
- Explicit disclaimer that 2% overage is modeled from Sellfy docs wording ("may start to charge").

## SEO/meta
- Title includes “Sellfy Pricing Calculator”.
- Description mentions plan cost, processor fees, and 2% overage fee.
- Back link to `/tools/`.

## Deliverables
- `tools/sellfy-pricing-calculator/index.html`
- `tools/sellfy-pricing-calculator/calculator.js`
- `tools/sellfy-pricing-calculator/calculator.test.js`
- `_data/tools-list.json` entry
- `tools/manifest.json` rebuild
- `tools/index.html` card
- `tools/index.md` list entry
