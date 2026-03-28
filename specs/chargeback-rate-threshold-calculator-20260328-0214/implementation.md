# Implementation — Chargeback Rate Threshold Calculator

## Files added
- `tools/chargeback-rate-threshold-calculator/index.html`
- `tools/chargeback-rate-threshold-calculator/calculator.js`
- `tools/chargeback-rate-threshold-calculator/app.js`
- `tests/unit/chargeback-rate-threshold-calculator.test.mjs`

## Files updated
- `tools/index.html`
- `tools/index.md`
- `_data/tools-list.json`
- `tools/manifest.json` (rebuilt via `bash scripts/build-manifests.sh`)

## What was implemented
1. **Pure calculator module**
   - deterministic validation
   - same-month ratio and lagged-denominator ratio
   - monitored / excessive threshold headroom
   - count-threshold warning state
   - dispute exposure math (gross, recovered, unrecovered, fee burn, monthly/annualized exposure)
   - copy-ready summary output

2. **Static UI**
   - responsive two-column layout
   - decision-ready KPI cards
   - detail table for headroom and exposure math
   - copy summary + reset actions
   - related navigation back to tools and adjacent chargeback tools

3. **Test coverage**
   - baseline safe scenario
   - monitored ratio breach
   - excessive threshold breach
   - count-only breach
   - validation failures
   - summary content
   - HTML anchor presence
   - discovery exact-once checks across index, tools-list, and manifest

## Important design choice
Public guidance conflicted on exact network denominator timing. Instead of hard-coding a brittle network claim, v1 computes **both** same-month and lagged-denominator ratio views. That is the main safety-driven product decision in this implementation.
