# Plan — p1-monetization-tools-trio-20260219-0834

## Implementation Strategy
1. Lock formulas/validation bounds via spec + test vectors.
2. Implement 3 calculators as independent single-file pages:
   - shared responsive card UI
   - deterministic compute core
   - summary text generation + copy button
3. Add discovery entries:
   - cards in `tools/index.html`
   - metadata entries in `_data/tools-list.json`
   - regenerate `tools/manifest.json`
4. Validate:
   - static checks (files/links/manifest entries)
   - local HTTP 200 checks for 3 routes
   - live URL checks after push when deploy becomes available
5. Commit and push only in `eastsea-blog`.

## Risk Controls
- **Duplicate risk:** pre-check slugs not already present.
- **Math/model risk:** explicit formula comments and edge-case guards.
- **Catalog drift:** regenerate manifest after all edits.
- **Dirty repo risk:** stage only task-relevant files.

## Done Definition
- SDD/TDD docs created first
- 3 tools implemented and accessible
- Discovery files updated
- Checkpoints written for each major step
- Commit hash + push + verification evidence captured
