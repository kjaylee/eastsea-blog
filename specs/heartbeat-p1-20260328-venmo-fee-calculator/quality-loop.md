# Quality Loop — Venmo Fee Calculator

## Iteration 1
### Score
- **94/100**

### What passed
- Research artifact created before implementation
- Spec / plan / red-team / test-cases artifacts created
- Static calculator shipped with bilingual UI
- Deterministic Node-testable calculation core
- Discovery surfaces wired exactly once
- Browser render verified with screenshot evidence

### Gaps found
- Local browser console showed a non-blocking `favicon.ico` 404 from the ad-hoc server
- No query-string/share-state feature in v1

### Action taken
- Accepted the favicon issue as environmental, not tool-specific
- Kept scope tight and avoided feature creep

## Iteration 2
### Score
- **96/100**

### Improvement made
- Added machine-readable evidence bundle at `artifacts/evidence.json`
- Confirmed manifest size matches actual file-size sum
- Recorded verification more explicitly

## Final status
- **Pass**
- Iteration scores: `94 → 96`
