# Plan — ai-retainer-profit-planner

1. Create pure logic module (`logic.mjs`)
   - defaults, validation, core calculator, summary builder.
2. Create UI module (`app.mjs`)
   - bind form fields, validate input, render KPIs/tier pricing, copy/reset actions.
3. Create responsive page (`index.html`)
   - input panel + KPI panel + tier table + summary box.
4. Add unit tests (`tests/unit/ai-retainer-profit-planner.test.mjs`)
   - 6 cases covering validation + economics monotonic behavior + summary content.
5. Rebuild manifest
   - run `bash scripts/build-manifests.sh`.
6. Run verification suite + collect command outputs in `verification.md`.
7. Run quality scoring and record residual gaps in `gap-analysis.md`.
