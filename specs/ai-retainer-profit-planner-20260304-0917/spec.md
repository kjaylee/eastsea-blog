# Spec — ai-retainer-profit-planner

## Problem
AI freelancers/agencies often quote retainers without clear unit economics, leading to underpricing and weak margins.

## Target user
- Solo AI consultant
- Boutique agency owner
- Fractional operator pricing service bundles

## Core user outcome
Given funnel and cost assumptions, user gets:
1. Suggested monthly retainers for Starter/Growth/Scale tiers
2. Churn-adjusted net revenue and operating profit
3. Break-even number of clients required
4. Copy-ready summary for sales/ops notes

## Functional requirements
- FR-01: Accept 12 numeric assumptions (leads, conversion rates, costs, margin, churn, upsell).
- FR-02: Validate all assumptions with bounded ranges.
- FR-03: Compute funnel (`qualifiedCalls`, `newClients`).
- FR-04: Compute tier stack (Starter/Growth/Scale) with risk-buffered delivery costs and margin-based pricing.
- FR-05: Compute monthly economics (`netRevenueAfterChurn`, `operatingProfit`, `operatingMarginPct`, `breakEvenClients`).
- FR-06: Render copyable summary text.
- FR-07: Reset to defaults in one action.

## Non-functional requirements
- NFR-01: Single-page tool under `/tools/{slug}/`.
- NFR-02: Mobile responsive at 390x844.
- NFR-03: No external JS dependencies.
- NFR-04: Logic exported in module form for deterministic unit testing.

## Success criteria
- SC-01: Unit tests pass for validation and economics behavior.
- SC-02: Tool appears in `tools/manifest.json` after rebuild.
- SC-03: HTTP 200 and expected title string confirmed via local server.
