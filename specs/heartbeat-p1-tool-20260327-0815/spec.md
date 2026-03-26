# Spec — Whop Payments Fee Calculator

## Goal
Ship exactly one new monetizable tool page at:
- `tools/whop-payments-fee-calculator/index.html`

## User story
As a creator evaluating Whop payouts,
I want to estimate processing fees, payout drag, and required pricing,
so that I can set prices and choose payout behavior with confidence.

## Inputs
- Gross sale amount (USD)
- Payment method
  - Domestic cards
  - International cards
  - International cards + FX conversion
  - ACH debit
  - Financing
- Payout method
  - Hold in balance / no payout fee allocation
  - Next-day ACH
  - Instant bank deposit
  - Crypto
  - Venmo
  - Bank wire
- Transactions per payout batch
- Transactions per month
- Target net take-home per transaction

## Outputs
### Per transaction
- Processing fee
- Payout fee allocated per transaction
- Total fees
- Net take-home
- Effective take rate
- Required gross sale amount to hit target net

### Monthly
- Gross processed volume
- Total processing fees
- Total payout fees
- Net take-home
- Payout count

## Logic requirements
- All fee logic lives in `logic.mjs`.
- Reverse pricing uses deterministic numeric solving (binary search is acceptable).
- ACH cap at $5 must be honored.
- Percentage payout fees apply to post-processing payout balance.
- Monthly payout totals must use exact batch math (`full batches + remainder`).
- Validation must reject invalid/negative inputs and invalid batch sizes.

## Content requirements
- SEO title, description, canonical, OG metadata.
- Short formula note.
- Notes/FAQ section with caveats.
- Link back to tools index.
- At least 3 related tool links.

## Discovery requirements
Tool must be added exactly once to:
- `tools/index.html`
- `tools/index.md`
- `tools/manifest.json`
- `_data/tools-list.json`

## Testing requirements
- Deterministic logic tests for at least:
  1. domestic cards + no payout fee
  2. international + FX + instant bank payout amortized over batch
  3. ACH cap branch
  4. financing path
  5. invalid input rejection
  6. exact-once catalog assertions
- HTML smoke test via local server + curl for title/canonical presence.

## Non-goals
- Country-specific local bank payout estimation
- Tax/VAT modeling
- Marketplace/platform commission estimation beyond Whop Payments public fee primitives
