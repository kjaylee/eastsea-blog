# Spec: `kdp-royalty-calculator`

## Goal
- Let authors estimate monthly KDP eBook royalties and Kindle Unlimited earnings with exact, editable assumptions.

## User intent
- “How much will I earn per sale on KDP?”
- “Should I choose 35% or 70%?”
- “How much do delivery costs and VAT reduce payout?”
- “How much do KU page reads add?”
- “What list price or unit volume do I need to hit my monthly royalty goal?”

## Inputs
- Royalty plan: `35%` or `70%`
- List price
- `VAT included` toggle
- VAT rate %
- Monthly eBook units sold
- Share of units sold in 70%-eligible territories %
- Delivery cost per sold eBook
- Monthly Kindle Unlimited pages read
- KU payout per page
- Target monthly royalty
- Target royalty per sold eBook

## Outputs
- Net list price excluding VAT
- Royalty per eligible-territory sale
- Royalty per non-eligible / 35% sale
- Blended royalty per sold eBook
- Monthly eBook royalty
- Monthly KU royalty
- Total monthly royalty
- Effective royalty rate on net consumer revenue
- Units needed to reach target monthly royalty
- Required list price to hit target royalty per sold eBook
- Delivery-cost ceiling before 70% loses its advantage on eligible sales

## UX requirements
- Single static HTML page with no build step.
- Bilingual support via EN/KO toggle.
- Strong first-screen explanation of KDP’s two income streams.
- Decision-ready KPI blocks plus a plain-text summary box.
- Clear note that KU payout per page is variable and should be updated from recent reports.

## Validation rules
- List price must be `> 0`.
- VAT rate must be `0–100`.
- Units sold and KU pages read must be `>= 0`.
- Eligible-territory share must be `0–100`.
- Delivery cost must be `>= 0`.
- KU payout per page must be `>= 0`.
- Target values must be `>= 0`.

## Non-goals
- Paperback or hardcover royalty modeling.
- Marketplace-by-marketplace price validation.
- Tax advice or accounting-grade reporting.
