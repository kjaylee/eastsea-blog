# Quality Loop — Merchant of Record vs Direct Billing Profit Calculator

## Iteration 1
### Score
- **92 / 100**

### What passed
- core calculator matched both golden fixtures
- HTML shipped with title, analytics include, related links, and all required inputs
- manifest entry added exactly once
- catalog exact-once checks passed

### Gaps found
- manifest top-level `count` was still stale after insertion
- verification artifact had not yet been updated with actual run results

### Action taken
- corrected `tools/manifest.json` top-level `count` from `627` to `628`
- reran catalog guard sanity check
- wrote final verification and gap-analysis artifacts

## Iteration 2
### Score
- **97 / 100**

### What passed after fixes
- `node --check` passed
- `node --test tools/merchant-of-record-vs-direct-billing-profit-calculator/calculator.test.js` passed (7/7)
- exact-once discovery regression script passed
- local HTTP smoke returned `200 OK`
- guard rerun no longer references the new slug

### Remaining caveat
- repo-wide catalog debt still exists, but it is outside this tool slice and was intentionally not changed

## Decision
Quality bar met.
Stop here rather than drifting into unrelated repo maintenance.
