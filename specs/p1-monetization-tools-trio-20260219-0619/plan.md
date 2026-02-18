# Plan — P1 Monetization Tools Trio (2026-02-19 06:19 KST)

1. Define formulas, KPI outputs, and validation constraints for all 3 calculators.
2. Implement each tool as a single responsive HTML file with inline style/script.
3. Add real-time validation states and suppress KPI output when input is invalid.
4. Ensure each page has a home link with exact `href="/"`.
5. Quick-validate each page locally:
   - invalid input triggers readable error
   - sane defaults produce finite KPI values
6. Update `tools/manifest.json` to include the 3 new slugs.
7. Update `_data/tools-list.json` with 3 new tool metadata entries.
8. Commit and push changes from inside `eastsea-blog` only.
9. Verify live URLs return HTTP 200.