# Plan — P1 Business Tools Kickoff (2026-02-19)

1. Finalize formulas and UX schema for 3 tools.
2. Implement each tool as single `index.html` (inline CSS/JS).
3. Add validation + error messaging + KPI cards.
4. Local smoke test (open in browser, change inputs, verify outputs).
5. Regenerate `tools/manifest.json` using `scripts/build-manifests.sh`.
6. Regenerate `_data/tools-list.json` by scanning `tools/*/index.html` title/description.
7. Git add/commit/push on `eastsea-blog` only.
8. Verify deployed URLs on production domain after GitHub Pages propagation.
