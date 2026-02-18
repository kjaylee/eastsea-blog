# Spec — P1 Monetization Tools Trio (2026-02-19 06:10 KST)

## Goal
Ship 3 **new** monetization/ROI tools under `eastsea-blog/tools` as production-ready single-file HTML calculators.

## Selected Tools
1. SaaS LTV:CAC Analyzer
2. Refund Rate Profit Impact Calculator
3. Cohort Retention Revenue Estimator

## Required Deliverables
- `tools/saas-ltv-cac-analyzer/index.html`
- `tools/refund-rate-profit-impact-calculator/index.html`
- `tools/cohort-retention-revenue-estimator/index.html`
- `tools/manifest.json` updated with all 3 new tool slugs
- `_data/tools-list.json` updated with all 3 new tool URLs
- Live deployment verification with HTTP 200 on all 3 URLs

## Functional Requirements
- Each tool must be a standalone single `index.html` with inline CSS/JS.
- Mobile responsive layout without horizontal overflow.
- Robust numeric validation (finite values, allowed range checks, readable errors).
- KPI-focused outputs tied to monetization/profit decisions.
- Back-to-portal link must use exact `href="/"`.

## Non-Goals
- Backend integrations/API calls.
- Multi-file frontend framework migration.
- Non-monetization features.

## Acceptance Criteria
- Three new tool directories exist and render correctly.
- Validation blocks invalid or out-of-range values.
- `tools/manifest.json` includes:
  - `saas-ltv-cac-analyzer`
  - `refund-rate-profit-impact-calculator`
  - `cohort-retention-revenue-estimator`
- `_data/tools-list.json` includes URLs for all 3 tools.
- Production URLs return HTTP 200 after push.
