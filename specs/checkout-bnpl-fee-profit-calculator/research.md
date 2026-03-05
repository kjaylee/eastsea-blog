# Research — checkout-bnpl-fee-profit-calculator

## Objective
Create a **new** monetization calculator tool that estimates BNPL (Buy Now, Pay Later) impact on checkout profitability.

## Existing patterns reviewed
- `tools/partner-mdf-roi-calculator/index.html`
  - Single-page HTML with responsive 2-column layout.
  - Input validation + KPI cards + summary copy.
- `tools/checkout-one-click-upsell-revenue-calculator/`
  - Monetization framing with conversion uplift and break-even indicator.
- `tools/index.html`, `tools/index.md`, `tools/manifest.json`
  - Tool discovery wiring requires new card/bullet + manifest refresh.

## Required outputs
1. New unique slug directory under `tools/`.
2. Practical formulas for monthly net impact, annual net profit, ROI, payback, and break-even conversion lift.
3. Mobile-friendly UI with concise explanatory copy.
4. Wiring in `tools/index.html` and `tools/index.md`.
5. Regenerate `tools/manifest.json` via script.
6. Verification commands:
   - `node --check` (on calculator JS)
   - local HTTP 200 check for tool URL

## Formula design (chosen)
- Baseline orders/revenue/gross-profit from checkout sessions, base conversion, AOV, gross margin.
- BNPL scenario applies:
  - BNPL adoption share,
  - conversion lift for BNPL segment,
  - AOV uplift for BNPL orders,
  - variable BNPL costs (fee rate + fixed fee + loss rate),
  - monthly ops and one-time setup costs.
- Core outputs:
  - monthly net impact,
  - annual net profit,
  - annual ROI,
  - payback months,
  - break-even conversion lift (binary search).
