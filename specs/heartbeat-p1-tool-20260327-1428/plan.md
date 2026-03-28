# Plan — Fractional CMO Pricing Calculator

1. Create tool files:
   - `tools/fractional-cmo-pricing-calculator/index.html`
   - `tools/fractional-cmo-pricing-calculator/calculator.js`
   - `tools/fractional-cmo-pricing-calculator/app.js`
2. Implement pure calculator logic first.
3. Build static UI around the pricing model.
4. Add exact-once catalog wiring to:
   - `tools/index.html`
   - `tools/index.md`
   - `tools/manifest.json`
   - `_data/tools-list.json`
5. Add deterministic unit tests covering:
   - baseline output
   - alternate scenario
   - invalid validation
   - impossible pricing state
   - summary text anchors
   - HTML anchors
   - catalog exact-once wiring
6. Run verification:
   - syntax check: `node --check tools/fractional-cmo-pricing-calculator/calculator.js`
   - syntax check: `node --check tools/fractional-cmo-pricing-calculator/app.js`
   - tests: `node --test tests/unit/fractional-cmo-pricing-calculator.test.mjs`
   - local HTTP smoke via `python3 -m http.server`
   - browser render + screenshot on local page
7. Run quality loop and record scores.
8. Append concise shipment note to `memory/subagent-log.md`.

## Surgical edit policy
- Only change files inside `eastsea-blog`, plus the final required append in `memory/subagent-log.md`.
- Do not refactor unrelated tools.
- Preserve current dirty work in repo.
