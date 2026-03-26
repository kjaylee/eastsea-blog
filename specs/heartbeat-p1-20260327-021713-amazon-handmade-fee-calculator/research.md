# Research — Amazon Handmade Fee Calculator

## Goal
Ship one exact-match monetization tool with clear seller intent and low overlap versus the current eastsea-blog catalog.

## Decision
- **Chosen slug:** `amazon-handmade-fee-calculator`
- **Why this slug won:** it is already promised in repo discovery surfaces but missing on disk, so it closes a real catalog gap without inventing a speculative monetization angle.

## Discovery-surface audit
Evidence gathered in-repo on 2026-03-27 KST:

- `tools/index.md` already contains an exact-match entry for `./amazon-handmade-fee-calculator/`.
- `_data/tools-list.json` already contains one `/tools/amazon-handmade-fee-calculator/` entry with a specific marketplace-fee description.
- `tools/index.html` has no `amazon-handmade-fee-calculator/` card.
- `tools/manifest.json` has no `amazon-handmade-fee-calculator` entry.
- `tools/amazon-handmade-fee-calculator/` does not exist on disk.

Conclusion: discovery intent already exists, but the actual tool artifact is missing.

## Overlap check
Nearest live tools:
- `amazon-fba-profit-calculator`
- `etsy-fee-calculator`
- `etsy-fee-profit-calculator`
- `marketplace-fee-profit-calculator`

Why overlap is still low enough:
1. Amazon Handmade sellers are searching a platform-specific fee question, not generic marketplace math.
2. Handmade economics differ from FBA because the key concern is the 15% referral fee, the $1 minimum fee floor, and the onboarding/professional-fee edge case.
3. Etsy pages do not solve Amazon Handmade payout math or its exact fee naming.

## User-intent rationale
The exact-match phrase `amazon handmade fee calculator` maps to a high-intent seller task:
- determine payout after Amazon Handmade referral fees
- estimate per-order and monthly profit after maker costs
- decide what price is needed to hit a target profit
- understand when the $1 minimum fee hurts lower-priced items

## Public-source fee facts used
Official source research performed on 2026-03-27:

1. Amazon seller pricing page
   - Source: `https://sell.amazon.com/pricing/estimate`
   - Public facts used:
     - Professional selling account baseline is `$39.99/month + selling fees`.
     - Amazon provides fee estimation tools for seller-fulfilled products.

2. Amazon Handmade pricing page
   - Source: `https://sell.amazon.com/programs/handmade`
   - Public facts used from search snippets and public pricing copy:
     - Amazon Handmade sellers pay a `15% referral fee`.
     - There is a `$1 minimum referral fee`.
     - Handmade approval waives the ongoing monthly Professional selling fee.

## Product decision
Ship a static calculator focused on:
- item price
- shipping charged to buyer
- item cost, packaging, shipping, ads, and other per-order costs
- monthly orders
- optional first-month `$39.99` Professional selling plan charge
- optional ongoing monthly fee override for edge cases
- target monthly net profit

Outputs:
- referral fee per order
- payout after Amazon fees
- net profit per order
- monthly net profit
- effective referral rate
- break-even item price
- required item price for target monthly net
- payback order count for fixed monthly fees

## Modeling assumptions
- Referral fee is modeled on the product sale price only, with a 15% rate and a $1 floor.
- Shipping charged to buyer is treated as revenue but not part of the referral-fee base in this v1 model.
- Taxes, returns, chargebacks, storage, and FBA fees are excluded.
- The first-month Professional fee is optional and explicit because Handmade sellers may still care about initial onboarding cash drag.

## Why not the top purely-new candidate
`amazon-kdp-royalty-calculator` is lower-overlap from a catalog-taxonomy perspective, but `amazon-handmade-fee-calculator` is the better ship for this heartbeat because:
1. repo discovery already promises it
2. execution risk is lower
3. exact-match user intent is still strong
4. it repairs a visible catalog hole immediately
