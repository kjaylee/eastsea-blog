# Spec — Payhip Fee Calculator

## Slug
`payhip-fee-calculator`

## Title
Payhip Fee Calculator | 페이힙 수수료 계산기

## Primary user
Creators selling digital products, courses, memberships, or downloads on Payhip who need to compare Free/Plus/Pro take-home before upgrading.

## Scope
Build a static calculator that:
1. Computes monthly net profit for a selected Payhip plan.
2. Compares all three Payhip plans under the same sales assumptions.
3. Includes processor assumptions: Stripe baseline, PayPal USD baseline, and custom.
4. Solves for break-even price and target-net required price at the current monthly order count.
5. Shows plan-upgrade gross-sales thresholds (Free→Plus, Free→Pro, Plus→Pro).
6. Works fully client-side with deterministic Node tests.

## Inputs
- Average order value (USD)
- Monthly successful orders
- Refund rate (%)
- Current Payhip plan: Free / Plus / Pro
- Processor preset: Stripe domestic / PayPal USD baseline / Custom
- Custom processor rate (%)
- Custom processor flat fee (USD)
- Other monthly fixed cost (USD)
- Desired monthly net profit (USD)

## Outputs
- Monthly gross sales
- Refund loss
- Payhip transaction fees
- Payhip monthly plan fee
- Total processor fees
- Net before fixed monthly costs
- Monthly net profit
- Take-home per order before fixed costs
- Net profit per order after fixed costs
- All-in cost rate (refund + Payhip + processor + plan fee as share of gross)
- Break-even price at current order count
- Required price for desired monthly net profit
- Comparison table across Free / Plus / Pro
- Upgrade threshold gross sales: Free→Plus, Free→Pro, Plus→Pro
- Copyable summary block

## Math
Definitions:
- `grossSales = averageOrderValue * monthlyOrders`
- `refundLoss = grossSales * refundRate`
- `payhipTransactionFees = grossSales * planRate`
- `processorVariableFees = grossSales * processorRate`
- `processorFixedFees = monthlyOrders * processorFlatFee`
- `processorFees = processorVariableFees + processorFixedFees`
- `netBeforeFixedCosts = grossSales - refundLoss - payhipTransactionFees - processorFees`
- `monthlyNetProfit = netBeforeFixedCosts - planMonthlyFee - otherMonthlyCost`
- `takeHomePerOrderBeforeFixed = netBeforeFixedCosts / monthlyOrders`
- `netProfitPerOrder = monthlyNetProfit / monthlyOrders`
- `allInCostRate = (refundLoss + payhipTransactionFees + processorFees + planMonthlyFee) / grossSales`

Reverse pricing at current order volume:
- `contributionPerOrder = averageOrderValue * (1 - refundRate - planRate - processorRate) - processorFlatFee`
- `requiredPriceForTargetNet = (desiredMonthlyNetProfit + planMonthlyFee + otherMonthlyCost + monthlyOrders * processorFlatFee) / (monthlyOrders * (1 - refundRate - planRate - processorRate))`
- `breakEvenPrice = (planMonthlyFee + otherMonthlyCost + monthlyOrders * processorFlatFee) / (monthlyOrders * (1 - refundRate - planRate - processorRate))`
- Return `null` for reverse-price outputs when the denominator is `<= 0`.

Plan constants:
- Free: `$0/month + 5%`
- Plus: `$29/month + 2%`
- Pro: `$99/month + 0%`

Upgrade threshold gross-sales constants:
- `freeToPlusGross = (29 - 0) / (0.05 - 0.02) = 966.67`
- `freeToProGross = (99 - 0) / (0.05 - 0.00) = 1980.00`
- `plusToProGross = (99 - 29) / (0.02 - 0.00) = 3500.00`

Processor presets:
- Stripe domestic baseline: `2.9% + $0.30`
- PayPal USD baseline: `2.99% + $0.49`
- Custom: user-supplied rate and flat fee

## UX requirements
- Responsive single-page layout.
- Visible explanation that PayPal/Stripe fees are separate from Payhip plan fees.
- Clear note that PayPal preset is a USD planning baseline and real fixed fees vary by currency/country.
- Comparison table must show all plans under the same scenario.
- Copyable summary block.
- Back link to `/tools/`.
- Lightweight KO/EN dynamic copy is acceptable; combined bilingual field labels are also acceptable.

## SEO/meta
- Title includes “Payhip Fee Calculator”.
- Description mentions Free/Plus/Pro, processor fees, and break-even upgrade math.
- Canonical set to `/tools/payhip-fee-calculator/`.

## Deliverables
- `tools/payhip-fee-calculator/index.html`
- `tools/payhip-fee-calculator/calculator.js`
- `tools/payhip-fee-calculator/calculator.test.js`
- `tools/manifest.json` rebuild
- optional metadata polish for existing `_data/tools-list.json` entry if needed
