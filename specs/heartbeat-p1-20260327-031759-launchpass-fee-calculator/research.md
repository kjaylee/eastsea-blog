# Research — LaunchPass Fee Calculator

## Goal
Ship one new exact-match monetization tool with low overlap and clear search intent.

## Discovery evidence

### 1) Exact-match query has direct tool intent
- Search results for `launchpass fee calculator` already surface dedicated calculator pages from other tool sites.
- That indicates this is not a vague “pricing” query. Users want a transaction-level take-home calculator.

### 2) Official LaunchPass docs expose stable public fee inputs
- LaunchPass help article `How Much Does LaunchPass Cost?` says LaunchPass charges `$29 per month` plus `3.5% per transaction`, and notes that large communities may get reduced rates.
- LaunchPass help article `Stripe + LaunchPass: Complete Guide to Payments, Payouts, and Money Management` says the default US Stripe baseline is `2.9% + $0.30`, international cards can cost more, and refunded payments do **not** refund either the Stripe fee or the LaunchPass fee.
- Those two docs give enough precision to build a trustworthy v1 without scraping dynamic pricing or inventing assumptions.

### 3) Repo overlap is low
- Repo scan found no `launchpass` slug or string in:
  - `tools/`
  - `_data/tools-list.json`
  - `tools/index.html`
  - `tools/index.md`
  - `tools/manifest.json`
- Nearby creator-fee tools exist (`memberful-fee-calculator`, `ko-fi-fee-calculator`, `buy-me-a-coffee-fee-calculator`, `skool-fee-calculator` in banned recent list), but none cover LaunchPass’s exact fee stack of monthly plan fee + percentage fee + Stripe fee + non-refunded fee behavior on refunds.

## Why this slug wins
- Exact-match intent: `launchpass fee calculator`
- Clear monetization use case: community subscription take-home math
- Low overlap with banned recent slugs and current repo inventory
- Official docs support precise formulas
- Compact implementation surface: static calculator, no API dependency

## Proposed calculator model

### Inputs
- `monthlyGrossSales`
- `successfulCharges`
- `refundRatePct`
- `launchPassMonthlyFee`
- `launchPassTransactionRatePct`
- `processorPreset`
- `customProcessorRatePct`
- `customProcessorFlatFee`
- `otherMonthlyCost`
- `desiredMonthlyNetProfit`

### Key modeling choice
- Refunds reduce creator revenue, but both LaunchPass transaction fees and Stripe processing fees remain charged.
- That makes this more decision-useful than a generic “fee percentage” page.

## Non-goals for v1
- Multiple communities / workspace bundles
- Rush withdrawal fees
- tax jurisdiction logic
- Apple/Google in-app billing overlays
- coupon and free-trial modeling
- chargeback-specific dispute fee modeling

## Sources
- Official LaunchPass pricing help: `https://help.launchpass.com/en/articles/10192669-how-much-does-launchpass-cost`
- Official LaunchPass payments help: `https://help.launchpass.com/en/articles/9692203-stripe-launchpass-complete-guide-to-payments-payouts-and-money-management`
- Discovery/competition check: exact-match search results for `launchpass fee calculator`
