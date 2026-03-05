# Research — Extended Warranty Attach Rate Profit Calculator

## Existing tool patterns
- `tools/checkout-bnpl-fee-profit-calculator/index.html` + `calculator.js`
  - Two-column layout (inputs + KPI results), summary textarea, copy/reset buttons.
  - External JS file handles validation, calculations, break-even logic, and summary generation.
  - Styling: dark gradient background, cards, KPI tiles, table for details, pill status text.
- `tools/shipping-protection-attach-rate-roi-calculator/index.html`
  - Monetization attach-rate calculator for checkout add-on.
  - Uses inputs for attach rate lift, per-order economics, and fixed costs to compute ROI/payback and break-even attach rate.

## Index/manifest wiring
- `tools/index.html` lists tools as `.tool-card` entries with `href`, icon, name, description, and `data-tags`.
- `tools/index.md` contains a bullet list entry per tool with link + one-line summary.
- `tools/manifest.json` maintains `{ slug, title, url, size }` entries and `count/updatedAt`.

## Implications for new tool
- Create new folder under `tools/` with `index.html` and `calculator.js` for node `--check`.
- Match UI pattern: input grid, KPI tiles, status pill, detail table, summary + copy/reset.
- Provide attach-rate uplift economics and break-even attach rate.
