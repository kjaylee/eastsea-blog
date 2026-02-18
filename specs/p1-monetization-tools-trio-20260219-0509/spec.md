# Spec — P1 Monetization Tools Trio (2026-02-19 05:09 KST)

## Goal
Ship 3 **new** business/monetization calculators in `eastsea-blog/tools`, each as a single-file HTML app (inline CSS/JS), mobile responsive, with robust input validation and `Back to Portal` compatibility (`href='/'`).

## New Tools
1. **Influencer Campaign ROAS Calculator**
   - Slug: `influencer-campaign-roas-calculator`
   - Purpose: Estimate clicks/orders/revenue/profit for influencer campaigns and compute ROAS, ROI, and break-even orders.
2. **Wholesale Margin Pricing Calculator**
   - Slug: `wholesale-margin-pricing-calculator`
   - Purpose: Model expected wholesale order profit after fees, shipping, overhead, and returns; compute break-even/target unit prices.
3. **Upsell Conversion Profit Calculator**
   - Slug: `upsell-conversion-profit-calculator`
   - Purpose: Quantify incremental profit from post-purchase upsells with refund and cost assumptions; compute break-even attach rate and payback.

## Functional Requirements
- Each tool must:
  - Exist at `tools/{slug}/index.html`.
  - Be single-file HTML with inline CSS/JS only.
  - Be usable on mobile (single-column fallback at narrow widths).
  - Validate numeric ranges and show clear errors.
  - Prevent invalid math states (division by zero, invalid percentages, negative required values).
  - Include `<a href="/">Back to Portal</a>`.

## Integration Requirements
- Update `tools/manifest.json` to include all 3 new tools.
- Update `_data/tools-list.json` with 3 new entries.
- Commit + push in `eastsea-blog` only.
- Verify deployed URLs for all 3 tools return HTTP 200.

## Non-Goals
- No game development/polishing work.
- No external frameworks/build pipelines.
