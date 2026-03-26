# Spec — Stan Store Fee Calculator

## Objective
Create `tools/stan-store-fee-calculator/` as a standalone calculator that estimates Stan Store take-home under Creator vs Creator Pro and shows when Pro pays back.

## User
- Search-driven creator or solopreneur evaluating Stan Store plan economics
- Likely selling digital products, coaching, memberships, or subscriptions
- Needs a quick answer without signup or spreadsheet work

## Inputs
- Average order value
- Monthly orders
- Refund rate
- Billing mix:
  - one-time share
  - recurring share
- Processor preset:
  - Stripe US card
  - Stripe international card
  - Stripe Afterpay
  - Stripe Klarna
  - PayPal standard
  - custom
- Custom processor rate and flat fee
- Share of Pro-only uplifted orders
- Pro-only uplift rate or added gross revenue
- Other monthly operating cost
- Target monthly net income

## Outputs
- Gross sales
- Net billings after refunds
- Processor fees
- Creator monthly take-home
- Creator Pro monthly take-home
- Monthly delta
- Annual delta
- All-in cost rate for each plan
- Break-even monthly gross sales for Pro
- Required uplift to make Pro neutral
- Copyable summary

## Calculation rules
1. Stan transaction fee is fixed at `0%`.
2. Creator uses `$29/month`; Creator Pro uses `$99/month`.
3. Processor fees depend on the selected preset or custom override.
4. Recurring share may add the Stripe recurring surcharge when Stripe-based presets are used.
5. International share may add the Stripe international surcharge where relevant.
6. Pro-only uplift is optional and should affect Pro results only.
7. Refunds should reduce recognized billings before fee and take-home calculations.

## UX requirements
- English/Korean copy where feasible, matching repo norms
- Above-the-fold explanation of what changed between Creator and Pro
- Fast recalculation on input change
- Clear “planning model” note that processor terms vary by country/currency
- No external dependencies

## SEO / page contract
- Title: `Stan Store Fee Calculator | 스탠 스토어 수수료 계산기`
- Include exact-match keyword variants in title/description/summary copy
- Canonical path: `/tools/stan-store-fee-calculator/`
- Add one exact entry to:
  - `_data/tools-list.json`
  - `tools/index.html`
  - `tools/index.md`
  - `tools/manifest.json`

## Out of scope
- Stan checkout automation
- currency conversion
- tax/VAT compliance modeling
- country-specific PayPal fixed-fee matrix beyond editable assumptions
