# Plan — p1-monetization-tools-trio-20260219-0844

## Implementation Strategy
1. Finalize formulas + validation boundaries in spec and test vectors.
2. Build three calculators as independent single-file pages with:
   - shared responsive card layout
   - deterministic compute core (`validate` → `compute` → `render`)
   - summary generation + clipboard copy
3. Update discovery assets:
   - add cards to `tools/index.html`
   - append entries to `_data/tools-list.json`
   - regenerate `tools/manifest.json`
4. Validate with static checks + local HTTP 200 routes.
5. Commit/push in `eastsea-blog` only, then check live URLs.

## Risk Controls
- **Duplicate-tool risk:** verify target slugs do not exist before implementation.
- **Model correctness risk:** include break-even and cap edge cases in tests.
- **Catalog drift risk:** regenerate manifest after all file writes.
- **Repo-noise risk:** stage only files created for this run.

## Definition of Done
- SDD/TDD docs completed first
- 3 calculators implemented and responsive
- Discovery files updated and consistent
- Local and live URL checks recorded
- Checkpoint JSON saved per required step
- Commit hash + pushed branch reported
