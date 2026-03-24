# Plan — Buy Me a Coffee Fee Calculator

## Objective
Ship the already-advertised but currently unimplemented `buy-me-a-coffee-fee-calculator` page as one static, deterministic tool.

## Build sequence
1. Create `tools/buy-me-a-coffee-fee-calculator/`.
2. Implement pure calculator logic in `calculator.js`.
   - export default input constants
   - export scenario evaluator for both fee-coverage modes
   - export break-even / target-average helpers
   - export summary builder
3. Build `index.html`.
   - EN/KR strings
   - fee-coverage toggle
   - KPI cards
   - fee breakdown table
   - alternate-scenario comparison block
   - copyable summary block
4. Add deterministic tests in `calculator.test.js`.
   - baseline math
   - supporter-covers-fee scenario
   - reward-cost sensitivity
   - validation / null outputs
   - exact-once catalog checks
   - required HTML anchors
5. Rebuild `tools/manifest.json`.
6. Run syntax, tests, manifest rebuild, exact-once checks, and local HTTP smoke.
7. Score against spec/test checklist. If score < 90, fix once before reporting.

## Implementation notes
- Do **not** add another card to `tools/index.html`.
- Do **not** add another bullet to `tools/index.md`.
- Do **not** add another URL to `_data/tools-list.json`.
- Those discovery surfaces already contain the slug once. Duplicating them would create catalog drift.
- The missing pieces are the actual tool directory and the manifest entry.

## Suggested file responsibilities
### `calculator.js`
- constants for default rates
- `calculateScenario(input, mode)` where `mode` is `creatorCovers` or `supporterCovers`
- `calculate(input)` returning:
  - current scenario result
  - alternate scenario result
  - break-even average support amount
  - target average support amount
  - delta vs alternate
  - formatted summary data
- guardrail validation helpers

### `index.html`
- current EastSea calculator shell styling
- script tag for `./calculator.js`
- input controls with stable IDs / data hooks
- output containers matching the test plan

### `calculator.test.js`
- pure function numeric assertions first
- DOM / HTML string checks second
- exact-once discovery assertions last

## Verification commands
Run from repo root `eastsea-blog/`.

### Syntax + tests
- `node --check tools/buy-me-a-coffee-fee-calculator/calculator.js`
- `node --test tools/buy-me-a-coffee-fee-calculator/calculator.test.js`

### Manifest rebuild
- `bash scripts/build-manifests.sh`

### Exact-once checks
- `python3 - <<'PY'
from pathlib import Path
root = Path('.')
slug = 'buy-me-a-coffee-fee-calculator'
assert (root/'tools'/slug/'index.html').exists()
assert (root/'tools/index.html').read_text().count(f'{slug}/') == 1
assert (root/'tools/index.md').read_text().count(f'./{slug}/') == 1
assert (root/'_data/tools-list.json').read_text().count(f'/tools/{slug}/') == 1
assert (root/'tools/manifest.json').read_text().count(slug) == 1
print('exact-once OK')
PY`

### HTTP smoke
- `python3 -m http.server 4173 >/tmp/bmac-http.log 2>&1 & echo $! >/tmp/bmac-http.pid`
- `curl -I http://127.0.0.1:4173/tools/buy-me-a-coffee-fee-calculator/`
- `curl -s http://127.0.0.1:4173/tools/buy-me-a-coffee-fee-calculator/ | grep -E 'Buy Me a Coffee Fee Calculator|5%|2\.9% \+ \$0\.30|0\.5%'`
- `kill "$(cat /tmp/bmac-http.pid)"`

## Quality bar
Implementation is acceptable only if:
- the math matches the test cases exactly within normal rounding tolerance
- discovery surfaces remain exact-once
- local page serves with HTTP 200
- summary copy is understandable in EN and KO
- mobile layout stays usable without horizontal scrolling

## Exit criteria
Ready to report only when:
- tool directory exists
- manifest entry exists exactly once
- all deterministic tests pass
- smoke test passes
- no unintended catalog duplication is introduced