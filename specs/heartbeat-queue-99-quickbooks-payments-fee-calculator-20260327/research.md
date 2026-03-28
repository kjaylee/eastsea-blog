# Research — queue #99 QuickBooks Payments Fee Calculator

## Goal
Discover one distinct exact-match monetization tool gap for `eastsea-blog`, document it only, and avoid current repo slugs/pages/tools plus the user-listed recent heartbeat exclusions.

## Chosen tool
- Slug: `quickbooks-payments-fee-calculator`
- Exact-match page name: `QuickBooks Payments Fee Calculator`
- Why this lane: payment processing economics for SMBs, not creator/course/SaaS-metric overlap

## Repo-local gap proof
Checked on 2026-03-27 in `/Users/kjaylee/.openclaw/workspace/eastsea-blog`.

Commands used:
```bash
rg -n "quickbooks-payments-fee-calculator|quickbooks payments fee|quickbooks payments|quickbooks fee calculator" \
  specs tools tools/manifest.json _data/tools-list.json
```

Observed result:
- No matches.
- No `tools/quickbooks-payments-fee-calculator/` directory.
- No catalog entry in `tools/manifest.json` or `_data/tools-list.json`.
- No prior spec folder for the slug.

## Nearby repo overlap check
Existing adjacent tools:
- `square-fee-calculator`
- `paypal-fee-calculator`
- `stripe-fee-calculator`
- `payment-gateway-fee-margin-calculator`

Why this is still distinct:
- Those pages are generic processor math or different providers.
- None answer the exact-match query `quickbooks payments fee calculator`.
- This avoids the crowded creator/course/platform-fee cluster already expanded by recent topics like `bandcamp`, `beehiiv`, `fanfix`, `udemy`, `whop`, `stan-store`, `thinkific`, and `onlyfans`.
- This also stays out of nearby SaaS metric lanes like `saas quick ratio`, `saas magic number`, and `msp pricing`.

## Market validation
I checked live web results on 2026-03-27.

Primary official source:
- QuickBooks payment rates page: <https://quickbooks.intuit.com/payments/payment-rates/>

Supporting official source:
- QuickBooks payments product page: <https://quickbooks.intuit.com/payments/>

Supporting commercial-intent source:
- Fourlane QuickBooks credit card processing page: <https://www.fourlane.com/credit-card-processing/>

What this validates:
- The query is live and tool-shaped, not invented.
- Intuit itself publishes a rates/calculator-style page for QuickBooks Payments.
- Partner/reseller pages also compete on the same fee/rates decision, which is strong commercial-intent evidence.

## Public fee facts worth modeling
From QuickBooks' public rates page, crawled by search within the last 2 weeks and marked accurate as of 2025-07-31:
- Cards and digital wallets via invoices/recurring/quick requests: `2.99%`
- ACH bank payments: `1%`
- In-person payments: `2.5%`
- Keyed-in cards: `3.5%`
- Internationally issued card or international PayPal account surcharge: additional `1%`

Important nuance:
- QuickBooks also advertises discounted or alternate merchant-service rates in some official/partner contexts.
- That means the tool should treat published defaults as editable assumptions, not immutable truth.

## Conservative opportunity reasoning
- I am not claiming this is a giant-volume keyword.
- I am not claiming EastSea can outrank Intuit's official page easily.
- I am claiming the following narrower point: `quickbooks payments fee calculator` is a real, exact-match, commercially useful calculator query that is absent from the current repo and fits EastSea's proven fee-calculator format.

Why the opportunity is still practical:
- Searchers are usually close to a money decision: invoice setup, processor selection, margin protection, or quoting customers.
- QuickBooks fee math is simple enough for a static calculator and specific enough to capture direct tool intent.
- EastSea can add value with reverse-fee math, editable assumptions, monthly planning, and transparent caveats around discounted/custom rates.

Why this beats nearby alternatives for queue #99:
- Better monetization fit than a generic educational payment post.
- Lower overlap than another creator/course platform fee calculator.
- Cleaner exact-match intent than broad ideas like `payment processor calculator` or `invoice fees`.

## Proposed v1 angle
Build a static calculator focused on:
- per-transaction QuickBooks fee
- reverse mode: what to charge to net a target amount
- transaction-type switching across invoice card, ACH, in-person, and keyed
- optional international surcharge
- optional monthly transaction count for monthly/annual fee planning
- editable custom-rate override for merchants with negotiated pricing

## Suggested positioning
- Title: `QuickBooks Payments Fee Calculator | QuickBooks 결제 수수료 계산기`
- Primary query: `quickbooks payments fee calculator`
- Secondary queries:
  - `quickbooks payment fees`
  - `quickbooks processing fee calculator`
  - `quickbooks invoice fee calculator`

## Risks
- Intuit owns the official rate page, so upside is likely moderate rather than outsized.
- Rates may vary by merchant profile or negotiated discounts.
- International surcharge details can be misunderstood if mixed with ACH or non-card flows.

## Decision
Proceed with `quickbooks-payments-fee-calculator` as the cleanest queue #99 gap:
- repo-local gap confirmed
- exact-match intent confirmed
- commercially useful
- materially outside the excluded creator/course/SaaS-metric lanes
