# Spec — P1 Monetization Tools Trio (2026-02-19 04:31 KST)

## Goal
Ship 3 **new** business/monetization tools in `eastsea-blog` (no game work), each as a single-file HTML utility with strong calculator logic and input validation.

## Deliverables
1. `tools/ad-rpm-optimizer/index.html`
2. `tools/bundle-pricing-profit-calculator/index.html`
3. `tools/subscription-churn-recovery-calculator/index.html`
4. `tools/manifest.json` updated with all new tool slugs
5. `_data/tools-list.json` updated with all new tool URLs
6. Deployment verification showing HTTP 200 for each new production URL

## Functional Requirements
- Each tool must:
  - Be one `index.html` file with inline CSS/JS.
  - Be mobile responsive.
  - Include robust numeric/percent validation and readable error states.
  - Show monetization-centric outputs (revenue/profit/ROI/margin or equivalent KPI).
  - Include a portal link exactly using `href='/'`.

## Non-Goals
- Any game polishing, gameplay changes, or game deployment.
- Backend/API dependencies.

## Acceptance Criteria
- 3 new tool directories exist and render properly.
- Input validation blocks invalid ranges and non-finite values.
- `tools/manifest.json` includes all 3 new slugs.
- `_data/tools-list.json` includes all 3 new URLs.
- Production URLs return HTTP 200 after push.
