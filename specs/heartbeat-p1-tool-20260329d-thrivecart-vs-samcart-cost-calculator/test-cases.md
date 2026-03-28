# Test Cases — ThriveCart vs SamCart Cost Calculator

## Unit logic
- **TC-TS-01**: Baseline break-even month with `$495` upfront ThriveCart vs `$79/mo` SamCart should be month `7`.
- **TC-TS-02**: Required SamCart lift should equal extra monthly platform cost divided by contribution margin.
- **TC-TS-03**: SamCart can win cumulative take-home when user-entered revenue lift is large enough.
- **TC-TS-04**: Target-gross planner returns deterministic baseline gross requirements for both scenarios.
- **TC-TS-05**: Invalid inputs are rejected with a non-empty error.

## Structural
- **TC-TS-06**: HTML contains canonical URL, analytics script, `WebApplication` schema, and visible references to one-time/monthly/break-even framing.

## Discovery wiring
- **TC-TS-07**: Tool slug appears exactly once in:
  - `tools/index.html`
  - `tools/index.md`
  - `_data/tools-list.json`
  - `tools/manifest.json`

## Smoke verification
- **TC-TS-08**: `node --check` passes for both JS modules.
- **TC-TS-09**: local HTTP response includes the expected tool title and formula keywords.
- **TC-TS-10**: `bash scripts/build-manifests.sh` completes and includes the new slug.