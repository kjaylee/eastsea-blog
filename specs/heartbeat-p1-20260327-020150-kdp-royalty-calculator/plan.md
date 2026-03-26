# Plan: `kdp-royalty-calculator`

1. Create the calculator module.
   - Export defaults and pure calculation helpers.
   - Encode 35% / 70% royalty behavior and KU earnings math.
2. Build the HTML shell.
   - Add bilingual copy, inputs, KPI cards, detail blocks, summary textarea, and helper notes.
3. Add tests.
   - Cover baseline 70% math, 35% fallback behavior, VAT handling, KU earnings, reverse-price math, validation, HTML anchors, and discovery exact-once wiring.
4. Update discovery files only.
   - `_data/tools-list.json`
   - `tools/index.html`
   - `tools/index.md`
   - `tools/manifest.json`
5. Verify.
   - `node --check`
   - `node --test`
   - exact-once slug checks
   - localhost smoke if feasible
6. Commit and push if git metadata is writable.
