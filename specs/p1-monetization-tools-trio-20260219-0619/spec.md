# Spec — P1 Monetization Tools Trio (2026-02-19 06:19 KST)

## Goal
Ship 3 **new** monetization/business calculators under `eastsea-blog/tools/` as practical, deployable single-file HTML tools.

## Selected Tools
1. Discount Campaign Profit Lift Calculator
2. Invoice Factoring Cashflow Calculator
3. Channel Mix Unit Economics Calculator

## Required Deliverables
- `tools/discount-campaign-profit-lift-calculator/index.html`
- `tools/invoice-factoring-cashflow-calculator/index.html`
- `tools/channel-mix-unit-economics-calculator/index.html`
- `tools/manifest.json` updated with all 3 new slugs
- `_data/tools-list.json` updated with all 3 new URLs
- Live URL verification with HTTP 200 for all 3 tools after push

## Functional Requirements
- Each tool must be standalone `index.html` (inline CSS + inline JS).
- Mobile responsive layout with no horizontal overflow on narrow screens.
- All inputs must support basic guardrails (finite number checks, positive/range checks, readable errors).
- Outputs must include decision-ready monetization KPIs (profit, margin, ROI/cashflow impact, or unit economics).
- Back-to-home link on every tool must use exact `href="/"`.

## Non-Goals
- Editing or polishing existing games/tools.
- Backend APIs or database storage.
- Multi-file framework refactors.

## Acceptance Criteria
- Three new tool directories exist and render as calculators.
- Invalid inputs are blocked with explicit validation messages.
- `tools/manifest.json` contains:
  - `discount-campaign-profit-lift-calculator`
  - `invoice-factoring-cashflow-calculator`
  - `channel-mix-unit-economics-calculator`
- `_data/tools-list.json` contains URLs for all 3 tools.
- Production URLs return HTTP 200.