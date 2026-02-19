# Plan — P1 Monetization Tools Trio (2026-02-19 07:52 KST)

## Approach
1. Draft UX + KPI formulas for three calculators.
2. Implement each tool as a static `index.html` with shared design patterns (cards, KPI tiles, summary copy CTA).
3. Enforce validation and safe states for invalid input combinations.
4. Register the tools in tool listing + metadata files.
5. Regenerate `tools/manifest.json` and verify outputs.
6. Commit only relevant files on `master`, push, and validate live HTTP 200 responses.

## Files to Produce/Modify
- `tools/sales-capacity-plan-calculator/index.html`
- `tools/subscription-gross-net-retention-calculator/index.html`
- `tools/cash-discount-early-payment-calculator/index.html`
- `tools/index.html` (new cards)
- `_data/tools-list.json` (metadata entries)
- `tools/manifest.json` (via script)

## Validation Strategy
- Input validation errors shown inline.
- Edge cases: zero/negative values, percentages out of range, ramping reps > total, churn/contraction exceeding base, early-pay volume zero.
- KPI sanity checks: NRR/GRR, pipeline coverage ratios, ROI values.

## Deployment
- Run `bash scripts/build-manifests.sh`.
- `git add` only new/changed files, commit, and push.
- Wait for Pages deploy; verify HTTPS URLs return 200.