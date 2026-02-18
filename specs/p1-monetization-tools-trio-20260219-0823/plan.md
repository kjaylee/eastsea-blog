# Plan — p1-monetization-tools-trio-20260219-0823

## Implementation Strategy
1. **Spec lock**: finalize formulas, validation bounds, and output KPIs for each tool.
2. **TDD prep**: define deterministic test vectors (normal, edge, invalid) for each calculator.
3. **Implement tools** (single-file HTML each):
   - Shared visual system (cards, KPI tiles, mobile breakpoints)
   - Per-tool compute + validation + summary copy
4. **Wire discovery metadata**:
   - Add cards to `tools/index.html`
   - Add entries to `_data/tools-list.json`
   - Rebuild `tools/manifest.json` via `scripts/build-manifests.sh`
5. **Verification**:
   - Static integrity checks (file exists, required ids present)
   - Serve locally and verify HTTP 200 for each new URL
6. **Git delivery**:
   - Stage only task-related files
   - Commit with clear message
   - Push `master`

## Risk Controls
- **Slug collision risk:** pre-check directory/manifest uniqueness before creation.
- **Math errors:** explicit guards on impossible unit economics and divide-by-zero.
- **Metadata drift:** regenerate manifest after all files are finalized.

## Done Definition
- All execution-order steps complete
- Checkpoint files written in `.state/p1-monetization-tools-trio/20260219-0823/`
- Commit hash + push success recorded
