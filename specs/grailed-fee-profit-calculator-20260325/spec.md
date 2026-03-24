# Spec — grailed-fee-profit-calculator-20260325

## Slug
`grailed-fee-profit-calculator`

## Output path
`tools/grailed-fee-profit-calculator/`

## Files
- `calculator.js` — IIFE logic module, exports `{ calculate, DEFAULTS }`
- `calculator.test.js` — node:test suite covering TC-GR-01 through TC-GR-09
- `index.html` — dark-card UI with bilingual KO/EN toggle

## Inputs

| Field | Type | Constraint |
|---|---|---|
| listPrice | number | >= 0 |
| offerDiscountPct | number | 0..100 |
| paymentProfile | enum | see below |
| itemCost | number | >= 0 |
| shippingCost | number | >= 0 |
| packagingCost | number | >= 0 |
| otherCost | number | >= 0 |

Payment profiles: `stripe-onboarded-domestic`, `stripe-onboarded-international`,
`not-onboarded-domestic`, `not-onboarded-international`, `non-stripe-country-default`

## Outputs

- realizedSalePrice
- grailedCommission
- processingFee
- totalPlatformFees
- payoutAfterFees
- sellerCostTotal
- totalCost
- netProfit
- netMarginPct
- effectiveFeeRatePct
- breakEvenListPrice (null if unreachable)
- maxOfferDiscountPct (null if unprofitable at 0%)
- summary (text block)
- status (localized string)

## Formula

```
realizedSalePrice = listPrice * (1 - offerDiscountPct / 100)
grailedCommission = realizedSalePrice * 0.09
processingFee     = realizedSalePrice * (rate/100) + flat
totalPlatformFees = grailedCommission + processingFee
payoutAfterFees   = realizedSalePrice - totalPlatformFees
sellerCostTotal   = itemCost + shippingCost + packagingCost + otherCost
totalCost         = totalPlatformFees + sellerCostTotal
netProfit         = realizedSalePrice - totalCost
netMarginPct      = netProfit / realizedSalePrice * 100
effectiveFeeRatePct = totalPlatformFees / realizedSalePrice * 100
```

## Defaults

```
listPrice = 180, offerDiscountPct = 0, paymentProfile = stripe-onboarded-domestic
itemCost = 70, shippingCost = 12, packagingCost = 0.75, otherCost = 0
```
