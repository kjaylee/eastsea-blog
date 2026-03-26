# Spec

## Tool
`ghost-membership-revenue-calculator`

## User
- Ghost publishers running paid memberships or paid newsletters
- Bloggers moving off Substack or comparing direct-Stripe economics
- Search visitors looking for a Ghost membership revenue or take-home calculator

## Job To Be Done
Help a Ghost creator estimate monthly-equivalent take-home after refunds, Stripe fees, Ghost plan cost, and member support overhead.

## Scope
- Static browser calculator
- No API calls
- Bilingual UI (`en` / `ko`)
- Deterministic formulas with Node-test coverage

## Inputs
- Monthly members
- Annual members
- Monthly price
- Annual price
- Ghost monthly plan cost
- Stripe fee rate (%)
- Stripe fixed fee
- Refund rate (%)
- Support cost per active member / month
- Target monthly net income

## Core Formula Model
- Annual memberships are amortized across 12 months for planning.
- Refund drag applies to monthly-equivalent gross.
- Stripe fixed fee is monthly-equivalent for annual members (`fixed fee / 12`).
- Net monthly equivalent:
  - gross
  - minus refund drag
  - minus Stripe variable fee
  - minus Stripe fixed fee
  - minus support cost
  - minus Ghost plan cost

## Outputs
- Monthly-equivalent net revenue
- Annualized net run-rate
- Effective cost rate
- Active members needed for target monthly net
- Members needed to cover Ghost plan cost
- Detailed fee and contribution breakdown
- Copyable summary block

## Non-Goals
- Live Ghost pricing lookup
- Tax / VAT / chargeback modeling
- Team payroll / content production budgeting
- Ghost vs Substack platform comparison
