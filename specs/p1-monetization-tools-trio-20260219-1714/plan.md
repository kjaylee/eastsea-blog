# Plan — p1-monetization-tools-trio-20260219-1714

## Implementation Strategy
1. Validate uniqueness of target slugs from `tools/manifest.json`.
2. Complete SDD/TDD docs in order: `spec.md` → `plan.md` → `test-cases.md` → `tasks.md`.
3. Implement 3 calculators as standalone pages with a shared structure:
   - i18n dictionary (KO/EN)
   - `validate → compute → render` pipeline
   - KPI cards + detail table + copy summary
4. Update discovery assets:
   - add cards in `tools/index.html`
   - append entries in `_data/tools-list.json`
   - regenerate `tools/manifest.json` via `scripts/build-manifests.sh`
5. Validate locally with `python3 -m http.server` + `curl`.
6. Commit and push only from `eastsea-blog` repo.
7. Poll GitHub Pages live routes until HTTP 200 or timeout (2 minutes).
8. Persist step checkpoints throughout pipeline.

## Risk Controls
- **Slug collision:** checked before file creation.
- **Formula errors:** cover with explicit scenario tests and edge cases.
- **Catalog drift:** manifest regenerated after all tool writes.
- **Release hygiene:** use explicit `git add` file list only.

## Definition of Done
- All SDD/TDD docs complete before implementation
- 3 tools implemented with KO/EN toggle + copy-summary + portal link
- Discovery files and manifest synchronized
- Local and live checks recorded
- Commit + push complete with required message
