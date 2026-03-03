# Research — llm-api-margin-calculator

## Goal
Ship one new **monetizable utility tool slice** that helps AI SaaS founders estimate real monthly profitability from LLM usage (token costs + retries + cache hits + payment fees + fixed costs).

## Existing repo patterns reviewed
1. `tools/ugc-creator-package-pricing-calculator/logic.mjs`
   - Pattern: pure deterministic logic module with `DEFAULT_INPUT`, `validateInputs`, core calculator, summary builder.
   - Reuse: keep calculation logic testable and UI-agnostic.
2. `tests/unit/ugc-creator-package-pricing-calculator.test.mjs`
   - Pattern: Node built-in test runner, concise deterministic assertions, scenario-based checks.
   - Reuse: mirror naming and coverage structure for new calculator.
3. `scripts/build-manifests.sh`
   - Pattern: tool discovery generated from `tools/<slug>/index.html` + title extraction.
   - Reuse: ensure new tool has valid title and run manifest rebuild after implementation.
4. `tools/ugc-creator-package-pricing-calculator/index.html` + `app.mjs`
   - Pattern: mobile-first two-column layout, summary copy, localStorage persistence, live recalculation.
   - Reuse: same UX skeleton for fast shippable slice.

## Market / monetization rationale
- Many AI products underestimate gross margin because they model only top-line subscription revenue and ignore token volatility, retries, and payment fees.
- This calculator can drive monetization through:
  - lead magnet for paid AI-finance consulting,
  - upsell to premium planning templates,
  - internal decision tooling for pricing/packaging services.

## Vertical slice scope for this run
- New tool route: `/tools/llm-api-margin-calculator/`
- Deliverables:
  - pure logic module (`logic.mjs`),
  - UI + controller (`index.html`, `app.mjs`),
  - unit tests (`tests/unit/llm-api-margin-calculator.test.mjs`),
  - spec artifacts and verification evidence under this task folder.

## Risks and mitigation
- **Risk:** unrealistic input ranges produce misleading outputs.
  - **Mitigation:** strict bounds validation and immediate error states.
- **Risk:** profitability metrics become opaque.
  - **Mitigation:** explicit breakdown (token cost, infra, support, fee drag, fixed costs).
- **Risk:** shipping without deterministic proof.
  - **Mitigation:** formula assertions + syntax checks + route curl verification + manifest regeneration.
