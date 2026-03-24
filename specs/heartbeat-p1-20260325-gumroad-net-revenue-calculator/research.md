# Research — Gumroad Net Revenue Calculator

## Goal
Ship one high-ROI static creator-monetization tool that is not already shipped inside `eastsea-blog/tools` and does not overlap an existing live calculator.

## Repo gap check
Evidence gathered from the repo on 2026-03-25 KST:

- `tools/index.html:507` already links to `gumroad-net-revenue-calculator/` with creator-economy tags.
- `tools/index.md:24` already lists **Gumroad 순수익 계산기** with an exact description of the intended math: direct/profile sales, Discover sales, `10% + $0.50` direct fee, `30%` Discover fee, payout drag.
- Actual directory is missing: `tools/gumroad-net-revenue-calculator/` does not exist.
- Catalog metadata is also missing:
  - `_data/tools-list.json` contains `0` entries for `/tools/gumroad-net-revenue-calculator/`
  - `tools/manifest.json` contains `0` entries for slug `gumroad-net-revenue-calculator`

Conclusion: this is a real catalog gap, not an overlap. Discovery entry already exists; the shipping artifact does not.

## Why this candidate beats nearby options
Nearby creator-fee tools already shipped: `memberful-fee-calculator`, `sellfy-pricing-calculator`, `shopify-fee-calculator`, `paypal-fee-calculator`, `stripe-fee-calculator`, `ko-fi-fee-calculator`, `substack-newsletter-revenue-calculator` is listed in metadata but missing its page, and `creator-membership-platform-fee-comparator` already covers recurring-membership comparisons.

Why Gumroad now:
1. **Direct creator monetization intent** — sellers searching Gumroad fees are near a pricing or migration decision.
2. **Low implementation risk** — fee structure is simple and static.
3. **Catalog adjacency** — strengthens the existing creator/payments cluster without duplicating Memberful/Substack membership math.
4. **Existing repo intent** — the catalog card and diary references already point to this exact slug, so shipping it closes an obvious hole.

## Public-source fee facts used
### Official Gumroad pricing page
Source: `https://gumroad.com/pricing`

Public facts extracted:
- No monthly fee.
- `10% + $0.50` per transaction for sales through creator profile or direct links.
- `30%` per transaction for Discover marketplace sales.
- Since Jan 1, 2025 Gumroad acts as merchant of record and handles tax collection/remittance.

### Official/help-center search-result evidence
Source: Brave result for `site:gumroad.com/help Gumroad's fees`
- Help snippet states the `10% + $0.50` direct fee **does not include** credit-card / PayPal processing.

Source: Brave result for `site:gumroad.com/help Gumroad payout schedule official`
- Help snippet states creators are typically paid **every Friday** for non-PayPal sales.

## Product decision
Ship `gumroad-net-revenue-calculator` as a static calculator focused on:
- direct/profile gross sales + order count
- Discover gross sales + order count
- estimated direct-payment processing preset or custom override
- payout-delay drag as a working-capital cost

This keeps the tool decision-ready while remaining transparent about what is official Gumroad pricing vs user-controlled processing assumptions.

## Reference implementation patterns
Reuse proven local patterns from:
- `tools/memberful-fee-calculator/` — bilingual UI, summary block, comparison table, exact-once discovery tests
- `tools/whatnot-seller-fee-calculator/` — compact standalone calculator module with deterministic math tests

## Non-goals
- No live API pricing fetch.
- No tax-rate engine.
- No Gumroad account integration.
- No refund model unless officially evidenced in-source for this run.
