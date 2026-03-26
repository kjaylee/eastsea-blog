# Research — cash-discount-early-payment-calculator

## Discovery surfaces checked
- `_data/tools-list.json`
  - Found an existing discovery entry for `/tools/cash-discount-early-payment-calculator/`.
  - The entry describes a seller-side ROI model for early-payment cash discounts: eligible invoice share, adoption, discount rate, processing fee, working-capital savings, bad-debt reduction, ROI, payback, and break-even adoption.
- `tools/manifest.json`
  - No `cash-discount-early-payment-calculator` slug exists.
- `tools/index.html`
  - No landing card exists.
- `tools/index.md`
  - No markdown discovery entry exists.
- `tools/`
  - No filesystem directory exists for this slug.

## Existing overlap audit
- Existing nearby tool: `early-payment-discount-apr-calculator`
  - Focus: discount-cost vs financing-cost tradeoff and implied APR framing.
  - Current landing copy emphasizes APR, DSO change, ROI, and bad-debt savings.
- Chosen gap: `cash-discount-early-payment-calculator`
  - Focus: seller-side program planning with eligible invoice mix, projected adoption, payment-processing drag, working-capital benefit, and break-even adoption.
  - This is close enough to real search intent to be discoverable, but distinct enough to justify a separate page and exact-match slug because the repo already promises this route in `_data/tools-list.json`.

## Why this slug
- It is a first-party verified catalog gap, not an invented topic.
- It matches a concrete monetization/finance workflow: deciding whether to launch a cash-discount early-payment program.
- It has lower overlap than generic fee/profit tools because it centers on invoice-payment terms, capital timing, and bad-debt reduction rather than marketplace/platform take rates.

## Scope choice
- Keep v1 centered on one program-level model.
- Do not model taxes, multi-currency, buyer-specific cohorts, or dynamic collection curves.
- Use editable assumptions for payment rail cost and bad-debt improvement instead of pretending there is one universal rule.

## Chosen slug
- `cash-discount-early-payment-calculator`

