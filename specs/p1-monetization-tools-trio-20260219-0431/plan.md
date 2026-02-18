# Plan — P1 Monetization Tools Trio (2026-02-19 04:31 KST)

1. Finalize tool formulas and validation ranges for all 3 calculators.
2. Implement each tool as standalone `index.html` with inline CSS/JS and responsive layout.
3. Add error messaging, formatting helpers, and KPI summaries per tool.
4. Ensure each page contains Back to Portal anchor with `href='/'`.
5. Run local verification for HTML presence and basic response code (`python -m http.server` + `curl`).
6. Update `tools/manifest.json` by rescanning `tools/*/index.html`.
7. Update `_data/tools-list.json` with the 3 new entries.
8. Commit only `eastsea-blog` changes and push to `origin/master`.
9. Poll production URLs until HTTP 200 is confirmed.
