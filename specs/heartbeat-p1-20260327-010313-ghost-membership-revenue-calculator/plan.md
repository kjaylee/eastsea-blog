# Plan

1. Create the spec bundle for the chosen slug.
2. Implement a pure calculator module with validation, formulas, warnings, and summary text.
3. Build a bilingual Ghost-specific calculator UI in repo style.
4. Add a Node test file for math, HTML wiring, and discovery exact-once checks.
5. Update only:
   - `_data/tools-list.json`
   - `tools/index.html`
   - `tools/index.md`
   - `tools/manifest.json`
6. Run:
   - `node --check`
   - `node --test`
   - exact-once slug checks
   - localhost smoke if available
7. Commit task-only files and push if git metadata allows it.
