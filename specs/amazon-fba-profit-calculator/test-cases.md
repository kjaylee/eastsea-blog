# Test Cases — amazon-fba-profit-calculator

## Preflight
- TC-P01: `tools/amazon-fba-profit-calculator/` does not already exist.
- TC-P02: `_data/tools-list.json` does not already contain `/tools/amazon-fba-profit-calculator/`.

## Logic
- TC-L01: validation rejects `referralFeePct + acosPct >= 100`.
- TC-L02: higher sale price increases monthly net profit in otherwise identical scenarios.
- TC-L03: higher ACoS decreases monthly net profit and break-even ACoS stays finite for valid scenarios.
- TC-L04: zero launch cost makes payback months `0` when monthly net profit is positive.
- TC-L05: summary contains monthly net profit, break-even ACoS, and required price text.

## Integration
- TC-I01: `node --check tools/amazon-fba-profit-calculator/logic.mjs` passes.
- TC-I02: `node --check tools/amazon-fba-profit-calculator/app.mjs` passes.
- TC-I03: `node --test tests/unit/amazon-fba-profit-calculator.test.mjs` passes.
- TC-I04: `bash scripts/build-manifests.sh` updates `tools/manifest.json` and includes slug `amazon-fba-profit-calculator`.
- TC-I05: `tools/index.html`, `tools/index.md`, and `_data/tools-list.json` each include the new tool.
- TC-I06: Local HTTP request to `/tools/amazon-fba-profit-calculator/` returns HTTP 200.

## Quality loop target
- Round 1 target score: >= 90/100.
- If below target, patch gaps and rerun the failed checks.
