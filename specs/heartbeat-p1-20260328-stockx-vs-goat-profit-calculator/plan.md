# Plan — StockX vs GOAT Profit Calculator

## Execution order
1. Create build-gate docs: spec / plan / red-team / test-cases.
2. Implement a comparison module that composes the shipped StockX and GOAT calculators.
3. Build a responsive HTML page with explicit per-platform assumptions and related links.
4. Add deterministic tests for math, reverse-solve behavior, HTML anchors, and exact-once discovery wiring.
5. Add discovery entries to `tools/index.html`, `tools/index.md`, and `_data/tools-list.json`.
6. Rebuild `tools/manifest.json` with `bash scripts/build-manifests.sh`.
7. Run syntax checks, unit tests, manifest rebuild, and localhost smoke.
8. Record verification + gap analysis.

## File targets
- `tools/stockx-vs-goat-profit-calculator/index.html`
- `tools/stockx-vs-goat-profit-calculator/calculator.js`
- `tools/stockx-vs-goat-profit-calculator/calculator.test.js`
- `specs/heartbeat-p1-20260328-stockx-vs-goat-profit-calculator/verification.md`
- `specs/heartbeat-p1-20260328-stockx-vs-goat-profit-calculator/gap-analysis.md`
- `specs/heartbeat-p1-20260328-stockx-vs-goat-profit-calculator/quality-loop.md`

## Small verifiable slices
### Slice 1 — formula composition
- wire StockX + GOAT inputs into one comparator
- keep API exportable for Node tests

### Slice 2 — UX shell
- render KPI cards, winner callout, detail blocks, summary, and related links

### Slice 3 — discovery
- add exact-once catalog entries
- rebuild manifest from filesystem truth

### Slice 4 — verification
- run Node checks/tests
- run localhost smoke against the final page

## Verification commands
```bash
node --check tools/stockx-vs-goat-profit-calculator/calculator.js
node --check tools/stockx-vs-goat-profit-calculator/calculator.test.js
node --test tools/stockx-vs-goat-profit-calculator/calculator.test.js
bash scripts/build-manifests.sh
python3 -m http.server 43128 --bind 127.0.0.1
curl -I http://127.0.0.1:43128/tools/stockx-vs-goat-profit-calculator/
curl -s http://127.0.0.1:43128/tools/stockx-vs-goat-profit-calculator/ | grep -E 'StockX vs GOAT Profit Calculator|Winner|StockX payout after fees|GOAT payout before seller costs'
```

## Surgical edit policy
- No unrelated fee-model rewrites in the source StockX / GOAT tools
- No workspace-root git
- No broad index regeneration beyond the required manifest rebuild
