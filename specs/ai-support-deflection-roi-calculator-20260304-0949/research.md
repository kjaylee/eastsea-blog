# Research — ai-support-deflection-roi-calculator

## Goal
Ship a new monetizable vertical slice that quantifies monthly/annual profit impact of AI customer-support ticket deflection.

## Existing repo patterns reviewed
1. `tools/white-label-agency-margin-calculator/logic.mjs`
   - Pattern: pure calculator module (`validateInputs`, `calculate*`, `buildSummary`) with strict numeric ranges.
   - Reuse: deterministic ROI math + explicit status classification.
2. `tools/white-label-agency-margin-calculator/app.mjs`
   - Pattern: localStorage-backed inputs, instant re-render, copyable summary.
   - Reuse: controller wiring and UI update pattern for low-friction tool slices.
3. `tests/unit/white-label-agency-margin-calculator.test.mjs`
   - Pattern: node:test behavior checks (validation + monotonic economics + summary key lines).
   - Reuse: same test style for confidence and fast CI.

## Monetization rationale
- Support teams evaluating AI support automation need quick, decision-ready ROI estimates.
- This tool can monetize as:
  - lead magnet for AI support setup services,
  - pricing qualifier for paid implementation packages,
  - top-of-funnel content for support-ops consulting retainers.

## Slice scope
- New slug: `/tools/ai-support-deflection-roi-calculator/`
- Inputs cover ticket volume, deflection rates, handling time, labor cost, AI variable cost, implementation cost, platform fee, quality monitoring overhead, and one-time setup cost.
- Outputs cover incremental deflected tickets, labor hours saved, gross savings, total program cost, net monthly benefit, annual net benefit, ROI, payback months, break-even target deflection.
- Unit tests include validation, monotonic economics, ROI finiteness, and summary content.

## Risks and mitigations
- Risk: invalid target/current deflection relationships.
  - Mitigation: validation enforces target deflection >= current deflection and both in sensible ranges.
- Risk: division by zero in break-even/payback calculations.
  - Mitigation: explicit guards; return `Infinity` only when economically no break-even.
- Risk: unclear stakeholder communication.
  - Mitigation: include compact board-ready summary text block.
