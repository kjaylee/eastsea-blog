# Research — ugc-creator-package-pricing-calculator

## Goal
Ship a **new monetizable tool slice** that helps UGC creators quickly quote package pricing for brand deals (videos + stories + usage rights + whitelisting + agency fee), with copyable summary for negotiation.

## Existing repo patterns reviewed
1. `tools/pricing-uplift-roi-calculator/index.html`
   - Pattern: single-page mobile-first UI, direct KPI cards, copyable text summary.
   - Reuse: dark-card visual language, compact input panel + KPI output panel.
2. `tools/creator-sponsorship-rate-calculator/index.html`
   - Pattern: creator economics model + bilingual labeling + validation guardrails.
   - Reuse: formula transparency, error-state behavior, clipboard summary.
3. `tests/unit/visit-counter.test.mjs`
   - Pattern: Node built-in test runner (`node --test`) with assert/strict.
   - Reuse: create deterministic unit tests for pure pricing logic in `.mjs` module.

## Opportunity / monetization rationale
- UGC creators and small talent agencies often quote manually in spreadsheets, creating inconsistent margins.
- A dedicated calculator can be monetized via:
  - lead magnet into paid consulting/templates,
  - premium tier (saved presets/history/export),
  - affiliate funnel for creator business tools.

## Vertical slice definition for this run
- Deliver a shippable static tool page under `/tools/ugc-creator-package-pricing-calculator/`.
- Include:
  - input validation,
  - deterministic quote formula,
  - KPI outputs,
  - copyable proposal summary,
  - localStorage persistence,
  - unit tests for pricing logic.

## Risks and mitigations
- Risk: Formula ambiguity for negotiations.
  - Mitigation: explicit component breakdown (reach value, production floor, usage fee, whitelisting fee, agency-adjusted quote).
- Risk: invalid values causing misleading numbers.
  - Mitigation: strict validation with hard bounds and explicit errors.
- Risk: not verifiable in this cycle.
  - Mitigation: unit tests + local static serve + curl content check.
