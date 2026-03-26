# Plan — Beacons Fee Calculator

1. Confirm the slug does not exist in `tools/`, discovery pages, or manifest files.
2. Reuse the repo’s proven fee-calculator pattern:
   - `index.html`
   - `calculator.js`
   - `calculator.test.js`
3. Implement pure compute helpers first so `node --test` covers deterministic math.
4. Build a compact bilingual UI with:
   - plan + processor presets
   - KPI blocks
   - fee breakdown
   - plan comparison table
   - summary export
5. Update only the required discovery files:
   - `_data/tools-list.json`
   - `tools/index.html`
   - `tools/index.md`
   - `tools/manifest.json`
6. Rebuild `tools/manifest.json` via `bash scripts/build-manifests.sh`.
7. Verify:
   - `node --check tools/beacons-fee-calculator/calculator.js`
   - `node --check tools/beacons-fee-calculator/calculator.test.js`
   - `node --test tools/beacons-fee-calculator/calculator.test.js`
   - slug exact-once checks across discovery files
   - local HTTP smoke if available
8. Commit only task-related files and push the current branch if git/network permissions allow.

