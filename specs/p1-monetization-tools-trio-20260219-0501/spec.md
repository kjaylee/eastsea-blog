# Spec — P1 Monetization Tools Trio (2026-02-19 05:01 KST)

## Goal
Ship 3 **new** business/monetization calculators in `eastsea-blog/tools`, each as a single-file HTML tool (inline CSS/JS), mobile responsive, with robust validation and `Back to Portal` link (`href='/'`).

## New Tools
1. **Break-even ROAS Calculator**
   - Slug: `breakeven-roas-calculator`
   - Purpose: Compute break-even ROAS, max CPA/CPC, and profit at current ad performance.
2. **Subscription Price Increase Impact Calculator**
   - Slug: `subscription-price-increase-impact-calculator`
   - Purpose: Model MRR/gross-profit change when price increases and churn changes.
3. **Conversion Funnel Revenue Forecast**
   - Slug: `conversion-funnel-revenue-forecast`
   - Purpose: Estimate funnel stage volumes, revenue, CAC, and target traffic gap.

## Functional Requirements
- Each tool must:
  - Be located at `tools/{slug}/index.html`.
  - Use inline CSS/JS only (no external build requirement).
  - Support small screens (single-column fallback under mobile breakpoint).
  - Validate all numeric inputs with clear error messages.
  - Render deterministic KPI outputs from formulas.
  - Include `<a href="/">Back to Portal</a>` for portal compatibility.

## Integration Requirements
- Update `tools/manifest.json`.
- Update `_data/tools-list.json` with 3 new tool entries.
- Commit + push changes in `eastsea-blog` repo only.
- Verify deployed URLs return HTTP 200.

## Non-Goals
- No game development or game polishing.
- No multi-file app refactor.
