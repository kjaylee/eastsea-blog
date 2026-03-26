# Research — Stan Store Fee Calculator

## Candidate decision
- Chosen slug: `stan-store-fee-calculator`
- Reason it won:
  - `Stan Store fee calculator` is a clean exact-match branded monetization query.
  - Current repo has a dense creator-platform cluster (`payhip`, `kajabi`, `podia`, `teachable`, `memberful`, `gumroad`, `substack`, `ko-fi`, `buy-me-a-coffee`) but **no Stan coverage** in:
    - `tools/`
    - `tools/index.html`
    - `tools/index.md`
    - `_data/tools-list.json`
    - `tools/manifest.json`
  - This makes overlap low while keeping commercial intent high.

## Repo discovery surfaces reviewed
- `tools/index.html`
  - Primary public landing page with tool cards and search tags.
- `tools/index.md`
  - Markdown discovery index used as a secondary catalog surface.
- `_data/tools-list.json`
  - Structured discovery feed powering downstream catalog/search usage.
- `tools/manifest.json`
  - Filesystem-derived manifest for shipped tool presence.
- `tests/usecase/tool-discovery.test.mjs`
  - Manifest integrity expectations.
- `scripts/tool-opportunity-ranker.py`
  - Internal evidence that business-intent fee/profit tools are prioritized, though this cycle needs a genuinely missing exact-match slug instead of a repair-only candidate.

## Existing-tool overlap check
- Nearby creator/platform fee tools already shipped:
  - `payhip-fee-calculator`
  - `kajabi-fee-calculator`
  - `podia-fee-calculator`
  - `teachable-fee-calculator`
  - `memberful-fee-calculator`
  - `gumroad-net-revenue-calculator`
  - `substack-fee-calculator`
  - `ko-fi-fee-calculator`
  - `buy-me-a-coffee-fee-calculator`
- Rejected alternatives:
  - `ghost-membership-fee-calculator`
    - Lower exact-match clarity because Ghost pricing questions often blur into hosting, newsletter, or self-hosting discussions already partially covered by membership/newsletter tools.
  - `whop-fee-calculator`, `beacons-fee-calculator`, `linktree-fee-calculator`
    - Plausible gaps, but Stan has clearer current fee primitives and stronger adjacency to the repo’s existing creator-monetization cluster.

## Official pricing evidence
### Stan plan pricing
- Source: `https://stan.store/blog/stan-store-pricing/`
- Fetched during this task on 2026-03-26.
- Relevant facts used:
  - Creator: `$29/month` or `$300/year`
  - Creator Pro: `$99/month` or `$948/year`
  - Stan says it charges `0%` transaction fees

### Stan processor-fee guidance
- Source: `https://help.stan.store/article/83-stan-stripes-transaction-fees`
- Fetched during this task on 2026-03-26.
- Relevant facts used:
  - Stan transaction fee: `0%`
  - Stan subscription fee: `$29/mo` or `$99/mo`
  - US Stripe baseline: `2.9% + $0.30`
  - Afterpay: `6.0% + $0.30`
  - Klarna: `5.99% + $0.30`
  - International customer fee: `+1.5%`
  - Recurring payments: `+0.5%`
  - Stripe payout fee: `0.25% + $0.25 per payout (min. $1)`
  - Refunds remove the full customer payment while processor fees are not returned
  - PayPal uses its own standard fees

### PayPal US baseline
- Source: `https://www.paypal.com/us/webapps/mpp/merchant-fees`
- Fetched during this task on 2026-03-26.
- Relevant facts used:
  - PayPal Checkout domestic rate: `3.49% + fixed fee`
  - International commercial transactions add `1.50%`
  - Fixed fee depends on currency, so the tool will label the built-in flat fee as a USD planning baseline rather than a universal exact value

## Product shape
Build one exact-match static tool that answers:
1. How much does Stan actually cost after processor fees and refunds?
2. Which billing option leaves more monthly take-home:
   - Creator monthly
   - Creator annual (monthly equivalent)
   - Creator Pro monthly
   - Creator Pro annual (monthly equivalent)
3. At the current order mix, how much extra gross sales would Creator Pro need to justify its higher subscription fee?
4. What selling price is required to hit a target monthly net under the selected plan?

## Scope boundaries
In scope:
- Public Stan pricing only
- Public processor-fee baselines only
- Refund-rate planning
- International-order share planning
- Recurring-order share planning
- Deterministic plan comparison and target-price math

Out of scope:
- Country-specific processor matrices beyond the built-in US/default baselines
- Tax/VAT logic
- Chargeback modeling
- Detailed payout-timing cashflow drag
- Feature-level ROI attribution for specific Creator Pro tools

## Why this is a good heartbeat P1 target
- Exact-match branded query with direct monetization intent
- Missing from every repo discovery surface today
- Low conceptual overlap with existing pages because the brand itself is absent
- Formula is simple enough to implement and verify in one cycle
