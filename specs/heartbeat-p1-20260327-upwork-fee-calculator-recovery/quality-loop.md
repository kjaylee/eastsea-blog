# Quality Loop — queue #85 upwork-fee-calculator recovery

- Round 1 score: 82/100
  - Gap: `tools/index.md` missing discovery entry
  - Gap: `_data/tools-list.json` missing discovery entry
  - Gap: discovery test only checked `>=1`, not exact-once structure
- Fixes applied
  - Backfilled `tools/index.md`
  - Backfilled `_data/tools-list.json`
  - Tightened `tools/upwork-fee-calculator/calculator.test.js`
- Round 2 score: 97/100
  - Syntax: pass
  - Deterministic tests: pass
  - Structured exact-once discovery: pass
  - Localhost smoke: pass
