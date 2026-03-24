# Research — Sellfy Pricing Calculator

## Goal
Ship one new monetizable static tool with clear buyer intent for creators evaluating Sellfy plan cost, processor fees, and overage risk.

## Anti-duplication proof
Checked required sources before selection:

- `tools/` directories: `sellfy` matches = 0
- `_data/tools-list.json`: `sellfy` matches = 0
- `tools/manifest.json`: `sellfy` matches = 0
- `/Users/kjaylee/.openclaw/workspace/memory/subagent-log.md`: `sellfy` matches = 0

Extended repo scan:
- `tools/index.html`: 0
- `tools/index.md`: 0
- repo-wide text scan: 0

Conclusion: `sellfy-pricing-calculator` is a fresh slug with no shipped or logged close variant.

## Buyer/search intent rationale
Why this is monetizable:
- Sellfy has direct buyer intent from creators choosing a storefront plan.
- Users evaluating creator commerce platforms care about real take-home, not only sticker pricing.
- Ads/affiliate-friendly niche: creator tools, digital products, subscriptions, merch, storefront pricing.
- Search-adjacent query family: "sellfy pricing", "sellfy fees", "sellfy transaction fee", "sellfy vs gumroad pricing", "sellfy overage fee".

## Source facts to model
Official Sellfy pricing page (`https://sellfy.com/pricing/`):
- Starter: $29/mo or effective $22/mo on annual billing
- Business: $79/mo or effective $59/mo on annual billing
- Premium: $159/mo or effective $119/mo on annual billing
- Annual sales caps: Starter up to $10k, Business up to $50k, Premium up to $200k
- No Sellfy transaction fee
- Payment processors still charge fees (typically 2.9% + $0.30)
- If seller exceeds annual sales cap and does not upgrade, Sellfy may start charging a 2% overage fee on revenue above the plan limit

Sellfy help center (`https://docs.sellfy.com/article/211-how-much-does-sellfy-cost`):
- Monthly prices: Starter $29, Business $79, Premium $159
- Yearly prices: Starter $264, Business $708, Premium $1428
- No transaction fees from Sellfy itself
- Stripe: 2.9% + $0.30 per transaction
- PayPal US: 2.9% + $0.30 per transaction
- PayPal worldwide average: 3.4% + $0.30 per transaction

## Product shape
Recommended tool shape:
- Static calculator with no backend
- Inputs:
  - plan
  - billing cycle
  - annual gross sales
  - orders per year
  - refund rate
  - delivery/COGS per order
  - other annual cost
  - processor preset / custom processor rate
- Outputs:
  - annual subscription cost
  - processor fees
  - Sellfy overage fee
  - take-home after platform costs
  - net profit
  - monthly net profit
  - cap headroom / overage
  - break-even gross sales
  - next-plan upgrade break-even revenue
  - cost-based recommended plan comparison table

## Calculation assumptions
- Processor percentage fee applies to gross sales.
- Processor flat fee applies to annual order count.
- Refunds reduce kept revenue but processor fees are still modeled on gross sales for conservative planning.
- Overage fee modeled deterministically as 2% of revenue above plan cap.
- Recommendation is cost-based only; feature gating is shown as a note, not modeled.

## Implementation references
Useful local patterns:
- `tools/whatnot-seller-fee-calculator/` for JS module + bilingual UI + tests
- `tools/etsy-fee-profit-calculator/` for summary copy and exact math tests
- `scripts/build-manifests.sh` for rebuilding `tools/manifest.json`

## Chosen slug
`sellfy-pricing-calculator`
