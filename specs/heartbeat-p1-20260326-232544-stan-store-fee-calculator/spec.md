# Spec — Stan Store Fee Calculator

## Slug
`stan-store-fee-calculator`

## Title
Stan Store Fee Calculator | 스탠 스토어 수수료 계산기

## Primary user
Creators evaluating Stan Store take-home and whether Creator Pro or annual billing is financially justified under their current sales mix.

## Goal
Ship a static exact-match fee calculator that turns Stan pricing, processor fees, refunds, and plan selection into a decision-ready take-home model.

## Functional scope
1. Compute monthly take-home for a selected Stan plan.
2. Compare all four billing options under the same assumptions:
   - Creator monthly
   - Creator annual (monthly equivalent)
   - Creator Pro monthly
   - Creator Pro annual (monthly equivalent)
3. Include processor presets:
   - Stripe standard
   - Stripe Afterpay
   - Stripe Klarna
   - PayPal USD planning baseline
   - Custom
4. Include international-order share and recurring-order share assumptions.
5. Solve for:
   - break-even price at the current order volume
   - required price for a target monthly net profit
   - extra monthly gross sales needed for Creator Pro to offset its higher subscription fee
6. Provide deterministic Node tests and exact-once discovery wiring checks.

## Inputs
- Selected plan
- Average order value
- Monthly successful orders
- Refund rate (%)
- Processor preset
- International-order share (%)
- Recurring-order share (%)
- Custom processor rate (%)
- Custom processor flat fee
- Custom international-fee add-on (%)
- Custom recurring-fee add-on (%)
- Other monthly fixed cost
- Desired monthly net profit

## Outputs
- Monthly gross sales
- Refund loss
- Processor variable fees
- Processor fixed fees
- Total processor fees
- Stan monthly-equivalent subscription cost
- Net before other fixed costs
- Monthly net profit
- Net profit per order
- All-in cost rate
- Break-even price
- Required price for target net profit
- Break-even monthly orders
- Required monthly orders for target net
- Best plan under current assumptions
- Creator annual savings vs monthly
- Creator Pro annual savings vs monthly
- Extra gross sales needed for Creator Pro monthly/annual to pay back its higher fee
- Copyable summary block

## Core math
Definitions:
- `grossSales = averageOrderValue * monthlyOrders`
- `refundLoss = grossSales * refundRate`
- `effectiveProcessorRate = baseRate + (internationalShare * internationalAddOn) + (recurringShare * recurringAddOn)`
- `processorVariableFees = grossSales * effectiveProcessorRate`
- `processorFixedFees = monthlyOrders * processorFlatFee`
- `totalProcessorFees = processorVariableFees + processorFixedFees`
- `netBeforeOtherCosts = grossSales - refundLoss - totalProcessorFees - planMonthlyFee`
- `monthlyNetProfit = netBeforeOtherCosts - otherMonthlyCost`
- `netProfitPerOrder = monthlyNetProfit / monthlyOrders`
- `allInCostRate = (refundLoss + totalProcessorFees + planMonthlyFee) / grossSales`

Reverse-price math at current order volume:
- `marginFactor = 1 - refundRate - effectiveProcessorRate`
- `breakEvenPrice = (planMonthlyFee + otherMonthlyCost + monthlyOrders * processorFlatFee) / (monthlyOrders * marginFactor)`
- `requiredPriceForTargetNet = (desiredMonthlyNetProfit + planMonthlyFee + otherMonthlyCost + monthlyOrders * processorFlatFee) / (monthlyOrders * marginFactor)`
- Return `null` if `marginFactor <= 0`

Reverse-order math at current price:
- `contributionPerOrder = averageOrderValue * marginFactor - processorFlatFee`
- `breakEvenOrders = (planMonthlyFee + otherMonthlyCost) / contributionPerOrder`
- `requiredOrdersForTargetNet = (desiredMonthlyNetProfit + planMonthlyFee + otherMonthlyCost) / contributionPerOrder`
- Return `null` if `contributionPerOrder <= 0`

Creator Pro payback under the current economics:
- `extraOrdersNeeded = (proPlanFee - creatorPlanFee) / contributionPerOrder`
- `extraGrossNeeded = extraOrdersNeeded * averageOrderValue`

## Constants
Plan monthly-equivalent fees:
- Creator monthly: `$29`
- Creator annual: `$25` (`$300 / 12`)
- Creator Pro monthly: `$99`
- Creator Pro annual: `$79` (`$948 / 12`)

Annual-plan savings:
- Creator annual vs monthly: `$48/year`
- Creator Pro annual vs monthly: `$240/year`

Annual-plan break-even commitment length:
- Creator annual vs monthly: `300 / 29 = 10.34 months`
- Creator Pro annual vs monthly: `948 / 99 = 9.58 months`

Processor presets:
- Stripe standard: `2.9% + $0.30`, international add-on `1.5%`, recurring add-on `0.5%`
- Stripe Afterpay: `6.0% + $0.30`, international add-on `1.5%`, recurring add-on `0%`
- Stripe Klarna: `5.99% + $0.30`, international add-on `1.5%`, recurring add-on `0%`
- PayPal USD baseline: `3.49% + $0.49`, international add-on `1.5%`, recurring add-on `0%`
- Custom: user-supplied

## UX requirements
- Responsive one-page calculator
- Clear note that Stan itself takes `0%` transaction fees
- Clear note that PayPal flat fees vary by currency and the built-in preset is a USD planning baseline
- Comparison table must show all four plan variants
- Copyable summary block
- No API calls; all logic runs client-side

## Deliverables
- `tools/stan-store-fee-calculator/index.html`
- `tools/stan-store-fee-calculator/calculator.js`
- `tools/stan-store-fee-calculator/calculator.test.js`
- discovery updates in:
  - `_data/tools-list.json`
  - `tools/index.html`
  - `tools/index.md`
  - `tools/manifest.json`
