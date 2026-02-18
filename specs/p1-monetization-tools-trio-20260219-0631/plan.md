# Plan — P1 Monetization Tools Trio (2026-02-19 06:31 KST)

1. Finalize formulas and input constraints for the three ROI calculators.
2. Implement each calculator as a responsive single-file HTML page.
3. Add input validation + error states to suppress invalid KPI rendering.
4. Ensure each page includes exact portal anchor `href="/"`.
5. Smoke-test each tool locally for:
   - valid defaults → finite KPI outputs
   - invalid values → readable validation errors
6. Update `tools/manifest.json` with the new slugs, titles, URLs, sizes, count, updatedAt.
7. Update `_data/tools-list.json` with title/description/url entries for all 3 new tools.
8. Commit only required files in `eastsea-blog` and push.
9. Verify production endpoints return HTTP 200 for all 3 URLs.