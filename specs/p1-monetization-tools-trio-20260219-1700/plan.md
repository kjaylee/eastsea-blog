# Plan — p1-monetization-tools-trio-20260219-1700

## Implementation Strategy
1. Verify uniqueness of selected slugs against `tools/manifest.json`.
2. Complete SDD/TDD docs in sequence (`spec` → `plan` → `test-cases` → `tasks`).
3. Implement 3 calculators as standalone `index.html` files with shared UX pattern:
   - responsive card layout
   - `validate → compute → render`
   - KO/EN i18n toggle
   - summary copy to clipboard
   - portal link `href="/"`
4. Update discovery files:
   - add 3 cards near monetization section in `tools/index.html`
   - add 3 entries in `_data/tools-list.json`
   - regenerate/update `tools/manifest.json`
5. Validate:
   - static sanity check (JSON parse, file existence)
   - local HTTP server + `curl` 200 checks
6. Deliver:
   - `git add -A && git commit -m "feat(tools): add 3 monetization calculators (1700 wave)" && git push origin master`
   - verify live URLs return 200 within 2 minutes

## Risk Controls
- **Duplicate concept risk:** pre-check slug existence in manifest before coding.
- **Formula error risk:** cover normal/invalid/impossible break-even cases in TDD scenarios.
- **Discovery drift risk:** treat manifest + tools-list + portal cards as one atomic update.
- **Deploy lag risk:** poll live URL status until timeout and record result.

## Definition of Done
- All four SDD/TDD docs exist and are filled.
- 3 new calculator directories each include only single `index.html`.
- Discovery files updated consistently.
- Local HTTP validation and live checks executed.
- Required git commit + push completed.
- Checkpoint files persisted under `.state/p1-monetization-tools-trio/20260219-1700/`.
