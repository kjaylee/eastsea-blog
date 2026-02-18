# Plan — P1 Monetization Tools Trio (2026-02-19 04:06 KST)

1. Confirm 3 target slugs are not already present in `tools/manifest.json`.
2. Implement each tool in `tools/{slug}/index.html` (single-file, inline CSS/JS, responsive).
3. Add robust formulas and validation guards for each calculator.
4. Add `href='/'` Back to Portal link on all 3 pages.
5. Run local static checks:
   - HTML file existence
   - `<title>` + `meta description`
   - Back-to-portal link and validation message wiring
6. Update `tools/manifest.json` via `scripts/build-manifests.sh`.
7. Update `_data/tools-list.json` with the 3 new tool entries.
8. Commit and push in `eastsea-blog` only.
9. Verify deployed URLs return HTTP 200 on production (`https://eastsea.monster/tools/{slug}/`).
