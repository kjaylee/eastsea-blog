# Research — Amazon KDP Royalty Calculator

## Goal
Ship one new, high-intent finance/creator tool in `eastsea-blog/tools` that is not already shipped and maps to strong SEO demand around self-publishing pricing decisions.

## Repo gap check
Evidence gathered inside the repo on 2026-03-28 KST:

- `find tools -maxdepth 1 -mindepth 1 -type d | grep -Ei 'kdp|kindle|paperback|ebook royalty|amazon kdp'` returned no KDP-specific calculator.
- `grep -RIn "kdp\|kindle\|amazon kdp" tools _data specs` returned no shipped KDP royalty tool and no placeholder catalog entry.
- Nearby Amazon commerce tools already shipped:
  - `tools/amazon-fba-profit-calculator/`
  - `tools/amazon-handmade-fee-calculator/`
- Nearby creator royalty tools already shipped:
  - `tools/redbubble-royalty-margin-calculator/`
  - `tools/printful-profit-calculator/`
  - `tools/printify-profit-calculator/`

Conclusion: `amazon-kdp-royalty-calculator` is a genuine catalog gap rather than an overlap.

## Why this candidate wins now
1. **High-intent search behavior** — authors search “KDP royalty calculator”, “Amazon KDP royalty”, “paperback royalty calculator”, and “Kindle royalty calculator” very close to a pricing decision.
2. **Clear user value** — a creator can instantly estimate ebook royalties under 35% vs 70% and paperback royalties under 50%/60%/40% rules.
3. **Low implementation risk** — formulas are deterministic and publicly documented by Amazon KDP.
4. **Strong cluster fit** — it extends the repo’s existing fee/profit/royalty calculator portfolio without duplicating existing Amazon seller tools.

## Public-source facts used
### 1) Official KDP eBook royalties
Source: `https://kdp.amazon.com/en_US/help/topic/G200644210`

Key facts extracted:
- KDP offers **35%** and **70%** eBook royalty options.
- 35% formula: `35% × (List Price - applicable VAT)`.
- 70% formula in eligible territories: `70% × (List Price - applicable VAT - Delivery Costs)`.
- Sales outside 70% eligible territories fall back to the 35% formula.
- Delivery costs vary by marketplace and file size.

### 2) Official KDP Digital Book Pricing Page
Source: `https://kdp.amazon.com/en_US/help/topic/G200634500`

Key facts extracted:
- Delivery cost examples/rates include:
  - Amazon.com: **US $0.15/MB**
  - Amazon.ca: **CAD $0.15/MB**
  - Amazon.co.uk: **£0.10/MB**
  - Amazon.de / .fr / .es / .it / .nl: **€0.12/MB**
  - Amazon.in: **₹7/MB**
  - Amazon.co.jp: **¥1/MB**
  - Amazon.com.mx: **MXN $1/MB**
  - Amazon.com.au: **AUD $0.15/MB**
  - Amazon.com.br: **R$0.30/MB**
- Minimum delivery charge applies per marketplace currency.
- If Amazon price-matches below the 70% minimum threshold, royalty can fall back to 35%.

### 3) Official KDP paperback royalty page
Source: `https://kdp.amazon.com/en_US/help/topic/G201834330`

Key facts extracted:
- Paperback royalties on Amazon marketplaces are now **50% or 60%**, depending on list price and marketplace threshold.
- Paperback formula on Amazon marketplaces: `(royalty rate × list price) - printing costs`.
- Expanded Distribution formula: `40% × list price - printing costs`.
- Threshold examples from the official chart:
  - Amazon.com: **50% at $9.98 and below**, **60% at $9.99 and above**
  - Amazon.co.uk: **50% at £7.98 and below**, **60% at £7.99 and above**
  - Equivalent thresholds exist for EUR, CAD, AUD, JPY, PLN, SEK markets.
- Printing cost depends on page count / ink / marketplace, so users should input printing cost manually from KDP’s own estimator or pricing tab.

### 4) Official KDP earnings overview
Source: `https://kdp.amazon.com/en_US/earn`

Key facts extracted:
- “Earn up to **70%** royalties on eBook sales.”
- “Earn up to **60%** royalties on print book sales.”
- KDP sample US math shows paperback royalty = `(0.60 × list price) - printing cost`.

## Product decision
Ship `amazon-kdp-royalty-calculator` as a static calculator with two modes:

1. **eBook mode**
   - Inputs: marketplace, list price, royalty plan (35/70), file size MB, VAT %, eligible-sales share %, monthly units sold.
   - Outputs: royalty per sale, monthly royalty, effective royalty rate, delivery drag, 35% baseline comparison.

2. **Paperback mode**
   - Inputs: marketplace, list price, printing cost per copy, Amazon-marketplace units, Expanded Distribution units.
   - Outputs: Amazon royalty per sale, Expanded royalty per sale, monthly total royalty, effective blended rate, break-even list prices.

## Scope guardrails
- Use only publicly documented KDP formulas from official pages.
- Require **manual printing-cost input** instead of embedding speculative print-cost tables.
- Treat 70%-plan eligibility rules beyond directly cited public facts as warnings, not hard guarantees.
- Keep the tool fully static and browser-only.

## Reference implementation patterns in repo
- `tools/amazon-fba-profit-calculator/` — split `logic.mjs` + `app.mjs`, deterministic unit tests.
- `tools/printful-profit-calculator/` — strong SEO metadata + exact-once catalog wiring tests.
- `tools/redbubble-royalty-margin-calculator/` — royalty-focused creator calculator structure.

## Non-goals for this slice
- No hardcover support in v1.
- No Kindle Unlimited page-read payout modeling.
- No live KDP pricing fetch or account integration.
- No automatic tax-jurisdiction engine.
