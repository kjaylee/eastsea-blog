# Research — gift-card-breakage-profit-calculator

## Goal
Ship a **new monetization tool** under `tools/` that calculates practical ROI/profit and is wired into the tools directory index surfaces.

## Files/Patterns inspected
- `tools/battle-pass-attach-rate-roi-calculator/index.html`
  - Single-page calculator pattern with concise hero copy
  - Mobile-first responsive CSS (`@media (max-width: 940px)`), KPI cards, status + summary
  - Uses `/assets/analytics.js`
- `tools/index.html`
  - Tool cards are manually listed near top of `<div class="tools-grid" id="tools-grid">`
  - New tool should be inserted as a new `<a class="tool-card" ...>` block
- `tools/index.md`
  - Markdown index mirrors discoverability with one bullet per tool (newest entries at top)
- `tools/manifest.json`
  - Canonical machine-readable listing (`slug`, `title`, `url`, `size`)
  - Must include new slug entry so external consumers can find the tool

## Implementation decision
- New slug: `gift-card-breakage-profit-calculator` (confirmed not present)
- Build with:
  - `tools/gift-card-breakage-profit-calculator/index.html`
  - `tools/gift-card-breakage-profit-calculator/calculator.js`
- Include practical business model:
  - Monthly issued gift-card value
  - Breakage rate
  - Gross margin on redeemed amount
  - Payment/fraud loss rates
  - Float yield + average liability hold period
  - Monthly ops + setup cost
  - Analysis months + target payback months
- Output KPIs:
  - Monthly lifecycle gross profit
  - Monthly net effect
  - Period net profit
  - ROI
  - Payback months
  - Break-even breakage rate for target payback

## Verification plan
1. `node --check tools/gift-card-breakage-profit-calculator/calculator.js`
2. `node --test` only if dedicated tests are added (not planned)
3. Local HTTP 200 proof by serving repo and curling the new route:
   - `python3 -m http.server <port>`
   - `curl -I http://127.0.0.1:<port>/tools/gift-card-breakage-profit-calculator/`
