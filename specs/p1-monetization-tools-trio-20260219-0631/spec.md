# Spec — P1 Monetization Tools Trio (2026-02-19 06:31 KST)

## Goal
Deploy 3 **new** business/monetization calculators under `eastsea-blog/tools/` with practical ROI/economics formulas and single-file responsive delivery.

## Selected Tools
1. Warehouse Automation CAPEX ROI Calculator
2. Dunning Recovery ROI Calculator
3. B2B Proposal Win Rate ROI Calculator

## Scope
- Create new tool directories and `index.html` files:
  - `tools/warehouse-automation-capex-roi-calculator/index.html`
  - `tools/dunning-recovery-roi-calculator/index.html`
  - `tools/b2b-proposal-win-rate-roi-calculator/index.html`
- Update catalogs:
  - `tools/manifest.json`
  - `_data/tools-list.json`
- Push to `eastsea-blog` remote and verify each live URL returns HTTP 200.

## Functional Requirements
- Each tool is standalone HTML (inline CSS + inline JS only).
- Each tool is mobile responsive (card stacking on narrow screens, no horizontal overflow).
- Every tool includes top portal link using exact `href="/"`.
- Every tool validates numeric inputs with user-readable error messages.
- Every tool provides actionable business KPIs:
  - annual or monthly net impact
  - ROI / payback
  - break-even threshold metric
  - summary text suitable for copy/share

## Non-Goals
- No edits to existing games.
- No refactor of existing tools.
- No backend/API dependencies.

## Acceptance Criteria
- 3 new calculators are present and functional.
- `tools/manifest.json` includes all 3 new slugs.
- `_data/tools-list.json` includes all 3 new URLs.
- All 3 deployed tool URLs respond with HTTP 200 after push.