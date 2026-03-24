# Research — Memberful Fee Calculator

## Goal
Ship one new monetizable static tool for creators evaluating Memberful’s real take-home after the fixed monthly platform fee, Memberful’s transaction fee, Stripe processing, refunds, and other monthly costs.

## Anti-duplication proof
Checked required catalog surfaces before selection:

- `tools/` directories: `memberful` matches = 0
- `_data/tools-list.json`: `memberful` matches = 0
- `tools/index.html`: `memberful` matches = 0
- `tools/index.md`: `memberful` matches = 0
- `memory/subagent-log.md`: `memberful` matches = 0
- repo-wide grep over `eastsea-blog/tools`, `eastsea-blog/specs`, `_data`, and memory log: 0 shipped/logged matches

Conclusion: `memberful-fee-calculator` is distinct from the current eastsea-blog tool catalog and recent memory log.

## Buyer/search intent rationale
Why this is monetizable:
- Memberful targets paid membership businesses with direct purchase intent.
- Creators comparing Memberful against Patreon, Substack, Ghost, and self-hosted membership stacks care about actual take-home, not just “4.9% + Stripe.”
- Search-adjacent query family is commercial: `memberful pricing`, `memberful fees`, `memberful transaction fee`, `memberful vs patreon`, `memberful stripe fees`, `memberful take home calculator`.
- This fits the site’s existing monetization-tool cluster without duplicating an existing slug.

## Source facts to model
### Memberful pricing page
Source: `https://memberful.com/pricing`
Observed via repo-safe HTTP fetch + HTML text extraction:
- Standard plan: `$49 / month`
- Transaction fee: `+ 4.9% transaction fee`
- Copy indicates the standard plan is the public default buyer-visible pricing.

### Memberful payment processing docs
Source: `https://memberful.com/help/memberful-101/payment-processing/` (redirects to docs)
- Memberful requires Stripe to process credit card payments.
- Memberful manages subscriptions, but Stripe handles payment processing and payouts.
- Memberful applies a `flat transaction fee of 4.9%` on purchases/renewals.
- Stripe charges an additional credit card processing fee that varies by country.

### Stripe pricing page
Source: `https://stripe.com/pricing`
- Domestic cards: `2.9% + 30¢` per successful transaction
- International cards: `+1.5%` on top of domestic-card pricing

## Product shape
Recommended tool shape:
- Static single-page calculator with no backend
- Inputs:
  - monthly gross sales
  - successful charges count
  - refund rate (%)
  - Stripe processor preset: domestic / international / custom
  - custom processor rate (%)
  - custom processor flat fee
  - other monthly fixed cost
  - desired monthly net profit
- Outputs:
  - Memberful monthly fee
  - Memberful transaction fees
  - Stripe processing fees
  - refund loss
  - take-home after platform costs
  - net profit
  - annualized net profit
  - average charge amount
  - effective fee rate
  - break-even monthly gross sales
  - required monthly gross for target net profit
  - processor comparison table

## Calculation assumptions
- Memberful standard plan is modeled as a fixed `$49/month` platform fee.
- Memberful transaction fee is modeled as `4.9%` of successful gross charges.
- Stripe processing defaults to official public pricing for domestic cards and official public international surcharge.
- Refund rate is a user assumption to reduce kept revenue; fees are still modeled on successful gross charges for conservative planning.
- Break-even and target-gross math assumes the current average charge amount stays constant as sales scale.
- This tool is cost-based only. It does not model churn, tax handling, community operations, or feature-value differences vs alternatives.

## Implementation references
Useful local patterns:
- `tools/whatnot-seller-fee-calculator/` for JS module + bilingual toggle + exact math tests
- `tools/sellfy-pricing-calculator/` for comparison-table pattern, summary generation, and verification style
- `scripts/build-manifests.sh` for rebuilding `tools/manifest.json`

## Chosen slug
`memberful-fee-calculator`
