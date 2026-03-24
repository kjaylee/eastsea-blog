# Research — Payhip Fee Calculator

## Candidate verification
- Preferred missing-candidate scan confirmed `payhip-fee-calculator` is **not shipped**:
  - `tools/payhip-fee-calculator/` directory: absent
  - `tools/manifest.json` slug: absent
- Discovery references already exist, which means the catalog promises the tool but the filesystem does not yet deliver it:
  - `tools/index.html` has one Payhip card
  - `tools/index.md` has one Payhip list entry
  - `_data/tools-list.json` has one Payhip entry
- Conclusion: this is a clean monetization-cluster gap to backfill with a real artifact.

## Existing implementation patterns reviewed
- `tools/memberful-fee-calculator/*`
  - Useful pattern for monthly plan fee + transaction fee + processor fee + target-net reverse math.
- `tools/gumroad-net-revenue-calculator/*`
  - Useful pattern for bilingual summary output, comparison rows, SEO-ready static page, and exact-once discovery test wiring.
- `tools/lemon-squeezy-fee-calculator/*`
  - Useful pattern for target price calculation and copy-ready summary structure.
- `tools/ko-fi-fee-calculator/*`
  - Useful pattern for processor presets and scenario comparison.

## Official pricing evidence
### Payhip plan pricing
Source: `https://help.payhip.com/article/102-billing-and-upgrading` fetched 2026-03-25.

Key facts captured from Payhip Help Center:
- Free plan: `$0/month + 5% transaction fee`
- Plus plan: `$29/month + 2% transaction fee`
- Pro plan: `$99/month + 0% transaction fee`
- PayPal and Stripe still charge their own transaction fees.

### Stripe baseline on Payhip
Source: `https://help.payhip.com/article/65-connecting-your-stripe-account` fetched 2026-03-25.

Key facts:
- Payhip documents Stripe’s standard baseline as `2.9% + $0.30 per transaction`
- Fees vary by country
- Stripe fees are collected by Stripe, not by Payhip
- Default Stripe payouts are daily after approval/onboarding timing

### PayPal baseline on Payhip
Source: `https://help.payhip.com/article/64-connecting-your-paypal-account` fetched 2026-03-25.

Key facts:
- PayPal fees vary by country
- Help Center states standard card processing baseline is `2.99% + fixed fee per transaction`
- Additional `1.5%` can apply to international commercial transactions
- PayPal fees are collected by PayPal, not by Payhip
- First payout may be delayed for approval; later payments can be instant/manual depending account setup

## Product decision
Build `Payhip Fee Calculator` as a static creator-planning tool focused on:
1. Comparing Free / Plus / Pro plan economics
2. Adding processor fee assumptions (Stripe baseline, PayPal USD baseline, custom)
3. Estimating monthly net profit and take-home per order
4. Solving for the selling price required to hit a monthly target net profit
5. Showing plan-upgrade break-even monthly gross thresholds

## Scope boundaries
In scope:
- Public Payhip plan fees only
- Processor-fee planning assumptions
- Refund-rate planning assumption
- Fixed monthly cost planning input
- Comparison table across plans

Out of scope:
- Taxes / VAT / sales tax remittance logic
- Country-specific processor pricing matrices
- Payout-delay cash drag modeling
- Marketplace-specific exceptions or partner discounts
- Subscription churn / cohort modeling

## Risk notes
- PayPal fixed fees vary by currency, so the built-in PayPal preset must be explicitly labeled as a USD planning baseline rather than official global pricing.
- Discovery already references this slug; implementation must preserve exact-once wiring and add the missing manifest entry without duplicating catalog copy.
