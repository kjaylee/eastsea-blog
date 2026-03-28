# Plan — Chargeback Rate Threshold Calculator

## Execution plan
1. Create deterministic `calculator.js` with validation, compute, summary, and status classification.
2. Create responsive `index.html` plus `app.js` DOM wiring.
3. Add unit test coverage for baseline, monitored breach, excessive breach, count-only breach, validation, HTML anchors, and catalog exact-once checks.
4. Wire discovery in `tools/index.md`, `tools/index.html`, and `_data/tools-list.json`.
5. Rebuild `tools/manifest.json`.
6. Run verification commands and capture real outputs.
7. Score against spec, fix if < 90, and record the quality loop.

## Surgical edit strategy
- Add one new tool folder only.
- Add one new unit test file only.
- Append one markdown index row.
- Insert one HTML tool card near adjacent chargeback tools.
- Append one tools-list entry.
- Rebuild only the tools manifest.
- No unrelated refactors.

## Verification commands (planned)
- `node --check tools/chargeback-rate-threshold-calculator/calculator.js`
- `node --check tools/chargeback-rate-threshold-calculator/app.js`
- `node --test tests/unit/chargeback-rate-threshold-calculator.test.mjs`
- `bash scripts/build-manifests.sh`
- `python3 scripts/tool-catalog-guard.py --root . --fail-on none`
- `python3 -m http.server 4173 -d .`
- `curl -I http://127.0.0.1:4173/tools/chargeback-rate-threshold-calculator/`

## Dependencies / assumptions
- No API keys required.
- Current repo already contains analytics asset path `/assets/analytics.js`.
- Manifest rebuild script remains authoritative for `tools/manifest.json`.
