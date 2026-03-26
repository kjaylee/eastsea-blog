# Plan

1. Confirm Ghost is a real low-overlap catalog gap.
2. Implement deterministic calculator logic in `calculator.js`.
3. Add node tests covering golden math, validation, and discovery exact-once wiring.
4. Build static `index.html` using the shared calculator logic.
5. Update only:
   - `_data/tools-list.json`
   - `tools/index.html`
   - `tools/index.md`
   - `tools/manifest.json`
6. Verify with:
   - `node --check`
   - `node --test`
   - slug exact-once checks
   - localhost smoke if possible
7. Commit task-only files and attempt push.
