# Test Cases — grailed-fee-profit-calculator-20260325

## TC-GR-01 — Stripe-onboarded domestic baseline

Input: listPrice=180, offerDiscountPct=0, paymentProfile=stripe-onboarded-domestic,
       itemCost=70, shippingCost=12, packagingCost=0.75, otherCost=0

Expected:
- realizedSalePrice = 180.00
- grailedCommission = 16.20  (180 * 0.09)
- processingFee = 6.77       (180 * 0.0349 + 0.49 = 6.282 + 0.49 = 6.772 → 6.77)
- totalPlatformFees = 22.97
- payoutAfterFees = 157.03
- sellerCostTotal = 82.75    (70 + 12 + 0.75)
- netProfit > 0
- breakEvenListPrice < 180

## TC-GR-02 — International raises fee

Input delta: paymentProfile=stripe-onboarded-international

Expected:
- processingFee > TC-GR-01 processingFee
- netProfit < TC-GR-01 netProfit

## TC-GR-03 — Not-onboarded domestic: flat $0.99

Input delta: paymentProfile=not-onboarded-domestic

Expected:
- processingFee > TC-GR-01 (same rate, higher flat: $0.99 vs $0.49)
- netProfit < TC-GR-01

## TC-GR-04 — Offer discount 15%

Input delta: offerDiscountPct=15

Expected:
- realizedSalePrice = 153.00
- grailedCommission < TC-GR-01 grailedCommission
- netProfit < TC-GR-01 netProfit

## TC-GR-05 — maxOfferDiscountPct bounds

Input: defaults

Expected:
- maxOfferDiscountPct between 0 and 100
- calc at (maxOfferDiscountPct - 1) → netProfit >= 0
- calc at (maxOfferDiscountPct + 1) → netProfit < 0

## TC-GR-06 — Break-even unreachable

Input: listPrice=25, itemCost=2000000, shippingCost=100000,
       packagingCost=10000, otherCost=10000, paymentProfile=not-onboarded-international

Expected:
- breakEvenListPrice = null

## TC-GR-07 — Invalid inputs rejected

Cases: negative listPrice, negative itemCost, offerDiscountPct > 100,
       unknown paymentProfile

Expected: result=null, error non-empty

## TC-GR-08 — Summary fields

Expected summary text contains:
List price, realized sale price, payment profile, total platform fees,
payout after fees, net profit, break-even, max offer discount

## TC-GR-09 — HTML anchors

Expected HTML contains IDs: langBtn, listPrice, paymentProfile, summaryArea
Expected HTML contains: analytics.js, calculator.js, "Grailed Fee Profit Calculator"
