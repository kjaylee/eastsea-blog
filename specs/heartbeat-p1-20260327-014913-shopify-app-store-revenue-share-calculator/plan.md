# Plan — shopify-app-store-revenue-share-calculator

1. Confirm candidate selection from discovery gaps and adjacent shipped tools.
2. Implement pure calculator logic with deterministic piecewise break-even math.
3. Build the browser UI with repo-style cards, KPI blocks, summary copy, and validation.
4. Patch discovery surfaces surgically:
   - `tools/index.html`
   - `tools/index.md`
   - `tools/manifest.json`
5. Verify with:
   - `node --check`
   - `node --test`
   - exact-once slug counts
   - localhost smoke if possible
6. Record evidence and quality notes.
7. Commit only task-related files and attempt push.
