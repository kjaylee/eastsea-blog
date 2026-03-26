# Research — Stan Store Fee Calculator

## Goal
Ship one new monetization tool with exact-match intent, low overlap, and a small enough implementation surface to complete in one heartbeat pass.

## Repo surfaces reviewed
- `tools/index.html`
- `tools/index.md`
- `_data/tools-list.json`
- `tools/manifest.json`
- Adjacent shipped creator/platform tools:
  - `substack-fee-calculator`
  - `payhip-fee-calculator`
  - `kajabi-fee-calculator`
  - `podia-fee-calculator`
  - `teachable-fee-calculator`
  - `gumroad-net-revenue-calculator`
  - `ko-fi-fee-calculator`
  - `buy-me-a-coffee-fee-calculator`
  - `creator-membership-platform-fee-comparator`

## External source anchors
- Stan Help Center, transaction-fee article, last updated **August 19, 2025**
- Stan Help Center, Creator vs Creator Pro plan article, last updated **September 15, 2025**

## Selection rationale
Chosen slug:
- `stan-store-fee-calculator`

Why it won:
1. No Stan-specific exact-match slug appears in the current repo discovery surfaces.
2. Adjacent creator monetization pages exist, but none answer the exact user question: “How much do I keep on Stan Store?”
3. Stan’s public model is simple enough for a static calculator:
   - Stan transaction fee: **0%**
   - Creator: **$29/mo**
   - Creator Pro: **$99/mo**
   - Processor fees remain external and editable
4. The tool can extend the existing creator-platform cluster without duplicating Substack/Payhip/Gumroad-style exact pages.

## Low-overlap evidence
Current adjacent coverage is strong around newsletter, membership, and course platforms, but still misses Stan:
- Covered: Substack, Payhip, Kajabi, Podia, Teachable, Gumroad, Ko-fi, Buy Me a Coffee, cross-platform membership comparison
- Missing: Stan-specific plan-cost and take-home modeling

This makes the page additive instead of cannibalistic.

## Core facts to model
### Stan platform economics
- Stan does not add a transaction fee on top of the creator’s processor.
- Fixed platform cost is plan-based:
  - Creator: `$29/month`
  - Creator Pro: `$99/month`

### Processor assumptions
- Stripe US baseline: `2.9% + $0.30`
- Stripe Afterpay: `6.0% + $0.30`
- Stripe Klarna: `5.99% + $0.30`
- Stripe international cards: `+1.5%`
- Stripe recurring payments: `+0.5%`
- PayPal baseline: `3.49% + fixed fee by currency`

### Pro-only value levers worth exposing as optional uplift
- dynamic pricing / payment plans
- discount codes
- upsells / order bumps
- Afterpay / Klarna
- affiliate tools
- email tools
- pixel tracking

These should not be hardcoded as guaranteed gains. They should be editable uplift inputs.

## Recommended tool shape
Build a static bilingual calculator that compares **Creator** vs **Creator Pro** under the same sales volume and processor assumptions, then optionally layers in a Pro-only revenue-lift model.

Primary outputs:
- gross sales
- refund-adjusted billings
- processor fees
- Stan subscription cost
- monthly take-home for Creator
- monthly take-home for Creator Pro
- net delta
- annual delta
- Pro break-even gross sales
- required Pro-only uplift to justify upgrade

## Implementation references
- `tools/payhip-fee-calculator/` for plan comparison and break-even framing
- `tools/substack-fee-calculator/` for exact-once discovery tests and fee-summary structure
- `tools/gumroad-net-revenue-calculator/` for creator take-home positioning and editable fee assumptions
