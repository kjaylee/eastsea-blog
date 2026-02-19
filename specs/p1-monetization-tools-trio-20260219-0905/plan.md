# Plan — p1-monetization-tools-trio-20260219-0905

## Implementation Strategy
1. Confirm new slugs are unique in `tools/`.
2. Build the three calculators as single-file responsive pages with shared layout and deterministic compute core.
3. Update discovery assets:
   - Append new tool cards in `tools/index.html`.
   - Append entries in `_data/tools-list.json`.
   - Regenerate `tools/manifest.json` via `scripts/build-manifests.sh`.
4. Validate locally with HTTP 200 checks for each tool route.
5. Commit + push in `eastsea-blog` only.
6. Wait 1–2 minutes, verify live URLs return HTTP 200.

## Risk Controls
- **Duplicate slug risk:** verify directory absence before creation.
- **Formula errors:** validate against test cases before commit.
- **Catalog drift:** regenerate manifest last after file writes.
- **Verification gap:** do not report until live checks pass.

## Definition of Done
- SDD/TDD docs completed in order
- 3 calculators implemented + responsive
- Discovery files updated
- Local and live URL checks recorded
- Checkpoints stored in `.state/p1-monetization-tools-trio/20260219-0905/`
- Commit hash available
