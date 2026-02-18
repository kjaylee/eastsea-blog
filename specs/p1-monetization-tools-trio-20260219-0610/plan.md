# Plan — P1 Monetization Tools Trio (2026-02-19 06:10 KST)

1. Finalize formulas + validation constraints for each selected calculator.
2. Implement each tool as one-file HTML (inline style/script), responsive first.
3. Add robust validation and explicit error states before rendering KPI outputs.
4. Ensure each page contains portal link with exact `href="/"`.
5. Run local checks for:
   - directory/file presence
   - `href="/"` compliance
   - baseline HTML accessibility in local static server
6. Regenerate/update `tools/manifest.json` so new slugs are included.
7. Update `_data/tools-list.json` with 3 new metadata entries.
8. Commit and push only inside `eastsea-blog` repository.
9. Verify live URLs with repeated `curl` checks until HTTP 200 confirmed.
