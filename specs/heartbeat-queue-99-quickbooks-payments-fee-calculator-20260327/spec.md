# Spec — QuickBooks Payments Fee Calculator

## Objective
Create a static calculator that estimates QuickBooks Payments fees for common transaction types and shows either:
- the net proceeds from a given charge amount, or
- the gross charge required to net a target amount.

## Users
- Small-business owners using QuickBooks Payments
- Bookkeepers or accountants estimating client processor costs
- Agencies/fractional finance operators protecting invoice margin

## Core user stories
1. As a merchant, I can estimate what QuickBooks takes from one payment.
2. As an operator, I can switch between invoice card, ACH, in-person, and keyed-in rates.
3. As a seller, I can reverse-calculate what to charge to net a target amount.
4. As a planner, I can estimate monthly and annual fee drag from expected transaction count.

## URL and metadata
- Slug: `quickbooks-payments-fee-calculator`
- URL: `/tools/quickbooks-payments-fee-calculator/`
- Title: `QuickBooks Payments Fee Calculator | QuickBooks 결제 수수료 계산기`
- Canonical: `https://eastsea.monster/tools/quickbooks-payments-fee-calculator/`

## Scope
### In scope
- One static tool page under `tools/quickbooks-payments-fee-calculator/`
- Pure calculator logic in a testable JS module
- Browser UI for forward and reverse calculations
- Comparison block for all supported QuickBooks payment types
- FAQ copy for exact-match SEO intent
- Catalog wiring once implementation starts

### Out of scope
- Tax, chargeback, refund, or bookkeeping reconciliation logic
- Non-US regional fee tables
- Live API pulls from Intuit
- Legal or accounting advice

## Inputs
- Transaction amount
- Calculation mode:
  - forward: “I will charge this amount”
  - reverse: “I want to net this amount”
- Payment type:
  - invoice or digital wallet
  - ACH
  - in-person
  - keyed-in
- International surcharge toggle
- Monthly transaction count
- Advanced optional overrides:
  - custom percentage rate
  - custom surcharge toggle or custom total rate

## Default assumptions
Use public QuickBooks baseline defaults from the official rates page dated 2025-07-31:
- invoice or digital wallet: `2.99%`
- ACH: `1.00%`
- in-person: `2.50%`
- keyed-in: `3.50%`
- international card / international PayPal surcharge: `+1.00%`

All defaults should be editable and labeled as planning assumptions.

## Outputs
- Total fee per transaction
- Net proceeds
- Effective fee rate
- Gross charge needed to net target amount
- Monthly total fees
- Annualized total fees
- Method comparison table for all supported QuickBooks payment types
- Copyable summary text

## Formula direction
Let:
- `baseRate` = published rate for selected payment type
- `intlRate` = `0.01` when international surcharge applies to card/digital-wallet flow, else `0`
- `totalRate` = `baseRate + intlRate`

Forward mode:
- `fee = amount * totalRate`
- `net = amount - fee`

Reverse mode:
- `gross = targetNet / (1 - totalRate)`
- `fee = gross - targetNet`

Volume planning:
- `monthlyFees = perTransactionFee * monthlyTransactionCount`
- `annualFees = monthlyFees * 12`

Method comparison:
- recompute `fee`, `net`, and `effectiveRate` for each supported payment type under the same amount

## Validation
- Numeric finite values only
- Amount must be greater than `0`
- Monthly transaction count must be integer-like and `>= 0`
- Custom total rate must be `>= 0` and `< 1`
- Reverse mode must block impossible states where `totalRate >= 1`
- International surcharge should not apply to ACH

## Content requirements
- Above-the-fold exact-match heading: `QuickBooks Payments Fee Calculator`
- One short caveat that rates can vary by plan, discount, or negotiated terms
- FAQ should answer:
  - What are QuickBooks Payments fees?
  - Does QuickBooks charge extra for international cards?
  - Is ACH cheaper than card payments in QuickBooks?
  - Why should the rates be editable?

## UX requirements
- Fast calculator-first layout
- Clear mode toggle between forward and reverse
- Transaction-type tabs or segmented controls
- Immediate visible result cards
- Mobile-safe form layout
- Copy summary action

## SEO requirements
- Exact-match title and H1
- Meta description should mention fee estimate, net proceeds, and target net mode
- WebApplication JSON-LD
- Related links only to adjacent existing payment-fee tools

## Done criteria
- Tool renders locally as a static page
- Calculator math is deterministic and tested
- Discovery/catalog wiring is exact-once
- Assumption note references the source date and editable-rate policy
