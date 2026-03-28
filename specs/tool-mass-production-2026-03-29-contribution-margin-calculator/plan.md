# Plan — Contribution Margin Calculator

## Build steps
1. Create a pure calculation module in `tools/contribution-margin-calculator/calculator.js` with defaults, validation, rounding helpers, summary builder, and deterministic exports.
2. Build `tools/contribution-margin-calculator/index.html` as a compact calculator page with bilingual-ready copy, KPI cards, formula block, explanation copy, examples, and copy-summary interaction.
3. Add `tools/contribution-margin-calculator/calculator.test.js` covering baseline math, invalid input handling, non-viable contribution scenarios, and summary output.
4. Add discovery entries to `_data/tools-list.json`, `tools/index.html`, and `tools/index.md`.
5. Rebuild `tools/manifest.json` with `bash scripts/build-manifests.sh`.
6. Run concrete verification commands and save their outputs in `verification.md`.
7. Score the outcome in `gap-analysis.md` and record any remaining non-blocking gaps.

## Verification commands
- `node --check tools/contribution-margin-calculator/calculator.js`
- `node --test tools/contribution-margin-calculator/calculator.test.js`
- `bash scripts/build-manifests.sh`
- `node --check tools/contribution-margin-calculator/calculator.js`
- `python3 - <<'PY' ... discovery exact-once checks ... PY`

## Red Team
- Attack point 1: Users may confuse contribution margin ratio with gross margin or assume fixed costs are included in the ratio.
  Mitigation: Put formulas directly on the page, label the ratio as unit contribution ratio, and separate pre-fixed-cost vs post-fixed-cost outputs in the explanation copy.
- Attack point 2: If variable cost per unit is greater than or equal to selling price, showing numeric break-even outputs would imply the business can recover fixed costs when it cannot.
  Mitigation: Validate the contribution margin threshold and explicitly return “not achievable at current unit economics” for break-even and target-profit volume.
- Verdict: Acceptable risk once the page makes the assumptions explicit and blocks misleading threshold outputs.
