# Spec — Amazon Handmade Fee Calculator

## Summary
Create a static, bilingual calculator at `/tools/amazon-handmade-fee-calculator/` that estimates Amazon Handmade referral fees, payout, per-order profit, monthly profit, and target pricing.

## Slug
- `amazon-handmade-fee-calculator`

## URL
- `/tools/amazon-handmade-fee-calculator/`

## Primary query intent
- amazon handmade fee calculator
- amazon handmade seller fees
- amazon handmade profit calculator
- amazon handmade referral fee

## Inputs
- `itemPrice` default `35`
- `shippingCharged` default `6`
- `monthlyOrders` default `40`
- `itemCost` default `12`
- `packagingCost` default `1.25`
- `shippingCost` default `5.5`
- `adCostPerOrder` default `2`
- `otherCostPerOrder` default `0`
- `includeFirstMonthProfessionalFee` default `true`
- `ongoingMonthlyFee` default `0`
- `targetMonthlyNetProfit` default `1000`

## Official constants
- `referralRate = 15%`
- `minimumReferralFee = 1`
- `firstMonthProfessionalFee = 39.99`

## Core formulas
- `referralFee = max(itemPrice * 0.15, 1)`
- `orderRevenue = itemPrice + shippingCharged`
- `sellerCostPerOrder = itemCost + packagingCost + shippingCost + adCostPerOrder + otherCostPerOrder`
- `payoutAfterAmazonFee = orderRevenue - referralFee`
- `netProfitPerOrder = payoutAfterAmazonFee - sellerCostPerOrder`
- `fixedMonthlyFees = ongoingMonthlyFee + (includeFirstMonthProfessionalFee ? 39.99 : 0)`
- `monthlyNetProfit = netProfitPerOrder * monthlyOrders - fixedMonthlyFees`
- `effectiveReferralRatePct = (referralFee / itemPrice) * 100`
- `breakEvenItemPrice = numeric root where netProfitPerOrder = 0`
- `requiredItemPriceForTargetMonthlyNet = numeric root where monthlyNetProfit = targetMonthlyNetProfit`
- `paybackOrders = ceil(fixedMonthlyFees / netProfitPerOrder)` when `netProfitPerOrder > 0` and `fixedMonthlyFees > 0`, else `null`

## Validation
- `itemPrice > 0`
- `monthlyOrders` must be an integer `>= 0`
- all money fields must be `>= 0`
- `targetMonthlyNetProfit >= 0`

## Outputs
- referral fee per order
- payout after Amazon fee
- net profit per order
- monthly net profit
- effective referral rate
- fixed monthly fees
- payback orders
- break-even item price
- required item price for target monthly net
- summary text for copy/export

## UI requirements
- Follow existing fee-calculator styling patterns used in marketplace/creator tools.
- Default language `ko` with `EN` toggle.
- Include:
  - hero title + concise description
  - input panel
  - KPI panel
  - detailed breakdown table
  - assumption note clarifying v1 scope
  - copy-summary button
- Include `/assets/analytics.js`.

## File set
- `tools/amazon-handmade-fee-calculator/index.html`
- `tools/amazon-handmade-fee-calculator/calculator.js`
- `tools/amazon-handmade-fee-calculator/calculator.test.js`
- `specs/heartbeat-p1-20260327-021713-amazon-handmade-fee-calculator/*`

## Discovery updates allowed
Only update:
- `_data/tools-list.json`
- `tools/index.html`
- `tools/index.md`
- `tools/manifest.json`

## Non-goals
- no live fee fetching
- no tax or refund engine
- no FBA math
- no marketplace-comparison mode
