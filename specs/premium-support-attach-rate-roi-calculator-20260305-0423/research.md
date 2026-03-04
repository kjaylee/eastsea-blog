# Research — premium-support-attach-rate-roi-calculator

## Goal
Ship one new monetization calculator focused on premium support plan economics for B2B SaaS.

## Existing repo patterns reviewed
1. `tools/ai-support-deflection-roi-calculator/logic.mjs`
   - Reusable pattern: deterministic ROI formulas, strict validation, summary builder.
2. `tools/white-label-agency-margin-calculator/app.mjs`
   - Reusable pattern: localStorage input persistence + instant render + copy summary.
3. `tools/index.html`
   - Reusable pattern: tool-card entry with tags, concise value proposition, discoverability via search.

## Monetization rationale
- Premium support is a practical expansion revenue lever in B2B SaaS.
- Teams need quick checks for attach-rate goals before committing staffing and tooling budget.
- Calculator doubles as sales enablement and internal business-case artifact.

## Scope
- New slug: `/tools/premium-support-attach-rate-roi-calculator/`
- Three-file structure: `index.html`, `app.mjs`, `logic.mjs`.
- Inputs include attach-rate baseline/target, support plan margin, retention uplift, and fixed+setup costs.
- Outputs include net monthly benefit, period net benefit, ROI, payback, and break-even attach rate.
- Add test coverage and index/manifest wiring.

## Risks and mitigations
- Risk: unrealistic assumptions causing invalid outputs.
  - Mitigation: bounded numeric validation and finite guards.
- Risk: break-even divide-by-zero.
  - Mitigation: explicit denominator checks and non-finite fallback.
- Risk: poor mobile usability.
  - Mitigation: responsive two-column-to-single-column layout with compact cards.
