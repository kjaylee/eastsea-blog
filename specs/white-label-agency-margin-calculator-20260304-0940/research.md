# Research — white-label-agency-margin-calculator

## Goal
Ship one monetizable vertical slice that helps agencies set profitable white-label retainers with explicit handling for:
- target margin,
- revision burden,
- scope creep,
- payment processing fees,
- team utilization drag.

## Existing repo patterns reviewed
1. `tools/llm-api-margin-calculator/logic.mjs`
   - Pattern: pure calculator module with `validateInputs`, `calculate*`, and `buildSummary`.
   - Reuse: deterministic math + explicit break-even metrics.
2. `tools/ugc-creator-package-pricing-calculator/app.mjs`
   - Pattern: localStorage persistence, real-time render, copy summary interaction.
   - Reuse: lightweight controller architecture without dependencies.
3. `tests/unit/llm-api-margin-calculator.test.mjs`
   - Pattern: Node built-in test runner with behavior-focused assertions.
   - Reuse: monotonic checks + summary-content checks.

## Monetization rationale
- White-label agencies frequently underprice due to hidden delivery time (revisions + creep).
- This tool can convert as:
  - lead magnet for agency pricing audit services,
  - upsell to premium templates/workbooks,
  - acquisition funnel for operations consulting retainers.

## Scope for this slice
- New tool route: `/tools/white-label-agency-margin-calculator/`.
- Inputs include utilization, revisions, creep, payment fee, and target margin.
- Outputs include break-even retainer, recommended retainer, margin gap, and summary copy block.
- Unit tests cover validation, monotonic behavior, finite break-even, and summary content.

## Risks and mitigations
- Risk: unrealistic input combinations producing undefined economics.
  - Mitigation: enforce strict validation and guard against `paymentFeePct + targetMarginPct >= 100`.
- Risk: unclear why recommended price changes.
  - Mitigation: expose driver breakdown (revision hours, creep hours, effective cost/hour).
