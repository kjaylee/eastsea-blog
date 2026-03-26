# Plan

1. Add the required spec bundle for traceability.
2. Implement `tools/spotify-royalty-calculator/index.html`.
3. Implement `tools/spotify-royalty-calculator/calculator.js` with:
   - pure calculation API
   - validation
   - summary builder
   - DOM wiring
4. Add `tools/spotify-royalty-calculator/calculator.test.js`:
   - core math cases
   - validation cases
   - summary text coverage
   - exact-once discovery assertions
5. Update only the required discovery files with one exact-match entry.
6. Run verification:
   - `node --check`
   - `node --test`
   - slug exact-once checks
   - localhost smoke if available
7. Commit only task files.
8. Attempt push.
9. Run the required `openclaw` command after completion.
