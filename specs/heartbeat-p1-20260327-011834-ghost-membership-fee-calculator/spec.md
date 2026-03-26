# Spec

## Tool
- Slug: `ghost-membership-fee-calculator`
- Title: `Ghost Membership Fee Calculator`

## User job
Estimate how much a Ghost publisher actually keeps after Stripe fees, refunds, Ghost(Pro) plan cost, and other monthly operating costs.

## Inputs
- Ghost plan preset
- Custom monthly Ghost cost
- Monthly membership price
- Monthly paid members
- Annual membership price
- Annual paid members
- One-time revenue this month
- One-time payments this month
- Refund rate
- Stripe variable fee
- Stripe fixed fee per charge
- Other monthly costs
- Target monthly net take-home

## Outputs
- Gross monthly-equivalent revenue
- Net take-home
- Effective take-home rate
- Monthly membership revenue
- Annual revenue smoothed monthly
- Processor total fees
- Ghost monthly cost
- Refund loss
- Estimated monthly charge count
- Break-even gross revenue
- Required paid members for target
- Additional paid members needed
- Contribution margin
- Copyable summary

## Rules
- Ghost(Pro) Starter must reject paid membership / one-time monetization scenarios.
- Annual members are converted to monthly-equivalent revenue and charge count by dividing by 12.
- Refund loss is modeled separately from processor fees.
- Ghost plan presets must be editable via a custom cost input.

## Non-goals
- Tax/VAT handling
- Churn modeling
- Email deliverability pricing by volume
- Stripe country-specific pricing by region
- Deferred revenue accounting
