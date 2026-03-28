# Research — Thinkific Fee Calculator

## Goal
Identify exactly one new monetization-tool gap for EastSea that is:
- exact-match searchable,
- high-intent,
- low-overlap with the existing catalog,
- and deterministic to verify against local discovery surfaces.

## Deterministic local gap audit
I checked the four EastSea discovery surfaces plus the expected tool directory:
- `tools/thinkific-fee-calculator/`
- `tools/index.html`
- `tools/index.md`
- `tools/manifest.json`
- `_data/tools-list.json`

### Result
`thinkific-fee-calculator` is absent from all of them.

Local verification notes:
- `tools/thinkific-fee-calculator/` does **not** exist.
- `grep` for `thinkific-fee-calculator` in `tools/index.html`, `tools/index.md`, `tools/manifest.json`, and `_data/tools-list.json` returned no matches.
- The only local mention of `thinkific-fee-calculator` is a future-gap note inside `specs/heartbeat-p1-20260327-skool-fee-calculator/gap-analysis.md`.

### Adjacent creator-platform coverage already live
From `tools/index.md`, EastSea already covers nearby creator/course/community monetization tools:
- `kajabi-fee-calculator`
- `podia-fee-calculator`
- `teachable-fee-calculator`
- `memberful-fee-calculator`
- `stan-store-fee-calculator`
- `skool-fee-calculator`

## Gap found
Chosen exact-match slug: **`thinkific-fee-calculator`**

## Why this is a good gap
1. **Exact-match intent is clean**
   - The slug maps directly to a clear query shape: “Thinkific fee calculator”.
   - It matches EastSea’s existing platform-specific naming convention (`teachable-fee-calculator`, `kajabi-fee-calculator`, `stan-store-fee-calculator`).

2. **High buyer/creator intent**
   - Thinkific sellers are typically asking a money question, not a curiosity question: “What do I actually keep after plan fees, payment processing, and Thinkific’s extra gateway fee?”
   - This makes the tool commercially aligned with monetization intent rather than generic traffic.

3. **Low overlap despite adjacent coverage**
   - EastSea already has strong creator-platform coverage, but there is a specific hole between Teachable/Kajabi/Skool/Stan and Thinkific.
   - That makes this a cluster-completion play, not a random new vertical.

4. **Deterministic formula surface**
   - Thinkific publishes public plan prices and public payment / gateway fee rules, which is enough for a credible v1 without guesswork-heavy modeling.

## Official source findings
Research captured on 2026-03-27 via browser extraction from official Thinkific pages.

### Source 1 — Thinkific pricing page
URL: `https://www.thinkific.com/pricing/`

Key facts captured:
- Basic: `$49/mo` or `$36/mo` annual equivalent
- Start: `$99/mo` or `$74/mo` annual equivalent
- Grow: `$199/mo` or `$149/mo` annual equivalent
- Plus: custom / talk to sales
- All prices are in USD and charged per site

Implication for v1:
- Public-plan calculator can model **Basic / Start / Grow** directly.
- Plus should be treated as out-of-scope or custom-price override only, because public pricing is not disclosed.

### Source 2 — “How much does Thinkific cost?” help article
URL: `https://support.thinkific.com/hc/en-us/articles/360030721393-How-much-does-Thinkific-cost`

Key facts captured:
- Payment processing fees vary by payment method and country.
- Third-party payment gateway fees apply on transactions processed using Stripe / third-party gateways.
- Third-party gateway fee table:
  - Basic: `5.0%`
  - Start: `2.0%`
  - Grow: `1.0%`
  - Expand: `0.5%`
  - Plus: `No fee at this time`
- The third-party gateway fee applies only to the **first `$1M` in sales per calendar year**.
- Transactions processed through **Thinkific Payments** do **not** incur this extra third-party gateway fee.

Implication for v1:
- This is the key differentiator versus a generic course-platform calculator.
- A strong v1 should model the **plan-specific extra fee** and the **remaining room under the $1M annual cap**.

### Source 3 — Thinkific Payments supported countries and transaction fees
URL: `https://support.thinkific.com/hc/en-us/articles/1500012376321-Thinkific-Payments-Supported-Countries-and-Transaction-Fees`

Key facts captured:
- Thinkific Payments uses region- and method-dependent fees.
- Example default card fees from the official table:
  - United States: `2.9% + $0.30`
  - Canada: `2.9% + C$0.30`
  - United Kingdom: `1.7% + £0.20`
  - Many EEA countries: `1.7% + €0.25`
- Subscription / payment plan surcharge: `+0.7%`
- Sales Tax & VAT solution fee: `+0.5%` when tax is assessed
- BNPL fees and bank-redirect fees are also documented, but are more specialized than core card flows

Implication for v1:
- A clean v1 should focus on **card flows** and allow either:
  - preset region defaults, or
  - custom processing-rate override.
- BNPL / bank redirect / invoicing can remain a later iteration.

## Product decision
Chosen tool: **Thinkific Fee Calculator**

### Why this one beats other nearby gaps
- Better exact-match intent than a broad `ghost-membership-revenue-calculator`
- Better cluster fit than another generic “course profit” tool
- More differentiated than a plain price calculator because Thinkific has a non-obvious extra fee layer:
  **public plan cost + payment processing + optional subscription surcharge + optional sales-tax solution fee + third-party gateway fee cap logic**

## Recommended v1 modeling scope
### Inputs
- plan tier (`basic` | `start` | `grow`)
- billing mode (`monthly` | `annual` monthly-equivalent)
- orders per month
- average order value
- payment setup (`thinkific-payments` | `third-party-gateway`)
- processor preset (`us-card` | `uk-card` | `eea-card` | `custom`)
- processing variable rate
- processing fixed fee
- subscription/payment-plan toggle (`+0.7%` when applicable on Thinkific Payments)
- tax-assessed toggle (`+0.5%` when applicable)
- refund rate
- year-to-date third-party sales (for `$1M` cap handling)
- other monthly costs
- desired monthly net profit

### Outputs
- monthly gross sales
- fixed Thinkific plan cost
- payment-processing fees
- extra third-party gateway fees
- refund loss
- take-home after Thinkific + payment stack
- monthly net profit
- annualized net profit
- effective platform/payment take rate
- break-even orders
- required orders for target net profit
- comparison across Basic / Start / Grow under the same assumptions
- Basic→Start and Start→Grow fee break-even thresholds
- remaining fee-exposed sales before the `$1M` annual cap is exhausted

## Non-goals for v1
- No Plus custom quote modeling beyond optional future override
- No full BNPL / bank-redirect / invoicing matrix
- No localization / FX payout forecasting
- No churn or cohort-retention forecasting
- No tax-law calculator; only the published `+0.5%` solution fee toggle
- No refund fee-reversal assumptions beyond conservative refund-loss handling

## Confidence and caveats
- Confidence is **high** that `thinkific-fee-calculator` is a real EastSea catalog gap.
- Confidence is **high** on public plan prices and the extra third-party gateway fee table, because both are published by Thinkific.
- Confidence is **moderate** on building a “universal” processor preset model, because Thinkific Payments fees vary by country, payment method, and payment type.
- Therefore v1 should stay narrow: **card-first defaults + custom override + clearly stated assumptions**.
