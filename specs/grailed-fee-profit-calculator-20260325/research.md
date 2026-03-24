# Research — grailed-fee-profit-calculator-20260325

## Summary

Grailed is a peer-to-peer marketplace for designer and streetwear apparel. Sellers pay:
- **Grailed Commission:** 9% of sale price (flat, all transactions)
- **Payment Processing:** varies by seller onboarding status and payment origin

## Fee Structure (verified from Grailed Help)

| Payment Profile | Processing Rate | Fixed Fee |
|---|---|---|
| Stripe-onboarded, domestic | 3.49% | $0.49 |
| Stripe-onboarded, international | 4.99% | $0.49 |
| Not onboarded, domestic | 3.49% | $0.99 |
| Not onboarded, international | 5.49% | $0.99 |
| Non-Stripe country default | 4.99% | $0.49 |

## Existing Seller-Profit Cluster Gap

Tools already present in the repo:
- etsy-fee-profit-calculator ✅
- ebay-fee-profit-calculator ✅
- poshmark-fee-profit-calculator ✅
- mercari-fee-profit-calculator ✅
- depop-fee-profit-calculator ✅
- grailed-fee-profit-calculator ❌ (this build)

## Target User

Grailed sellers pricing streetwear/designer listings who need to know:
1. What Grailed and payment processing take
2. Real net profit after item, shipping, and packaging costs
3. Break-even list price
4. Maximum offer discount before the sale turns unprofitable

## Scope Decision

Narrow v1: Grailed commission + payment processing baseline only.
No taxes, no live FX, no buyer-side shipping fee-basis modeling.
