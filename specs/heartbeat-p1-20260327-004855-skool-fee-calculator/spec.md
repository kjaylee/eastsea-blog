# Spec

## Goal

Ship one new exact-match monetization tool at `tools/skool-fee-calculator/` that helps creators estimate Skool Hobby vs Pro take-home and identify the break-even point between plans.

## Target query

- Primary: `skool fee calculator`
- Secondary: `skool pricing calculator`, `skool hobby vs pro calculator`

## User job

A creator wants to know:

- how much Skool Hobby keeps
- how much Skool Pro keeps
- whether Pro is already worth the higher monthly fee
- how high-ticket charges affect Pro fees

## Inputs

- Monthly members billed this month
- Monthly membership price
- Annual members billed this month
- Annual membership price
- One-time purchases billed this month
- One-time purchase price
- Refund / dispute drag rate (%)

## Outputs

- Gross billed this month
- Hobby net after subscription fee, transaction fees, refund drag
- Pro net after subscription fee, transaction fees, refund drag
- Net delta: Pro vs Hobby
- Winner at current mix
- Break-even billed gross at current mix
- Effective fee rate for each plan
- Breakdown by plan:
  - platform subscription
  - transaction fees
  - refund drag

## Formula notes

- Hobby:
  - fixed monthly fee: `$9`
  - transaction fee: `10% + $0.30` per transaction
- Pro:
  - fixed monthly fee: `$99`
  - transaction fee: `2.9% + $0.30` for tickets below the high-ticket threshold
  - transaction fee: `3.9% + $0.30` for tickets at or above `$900` based on the documented `up to $899` / `above $900` wording gap
- Refund/dispute drag:
  - modeled as a simple percentage deduction from gross billed
- Break-even gross:
  - `(99 - 9) / current_percent_savings_rate`
  - flat `$0.30` fee cancels out because it applies to both plans

## UX constraints

- Static HTML + JS only
- No external dependencies
- Strong first-screen clarity
- English-first with Korean support in title/description/helper copy
- Clear disclaimer that the page is a planning model, not official Skool tax/accounting advice
