# Research — google-play-net-revenue-calculator

## Goal
Ship one new static monetization tool for `eastsea-blog` that estimates Google Play take-home revenue after tax removal, refunds, Google Play fee, ad revenue, and monthly operating costs.

## Files reviewed before implementation
1. `specs/p1-tool-batch-2026-03-09-afternoon/research.md`
   - Confirms this slug is part of the current approved P1 batch and should fill a platform-specific monetization gap.
2. `specs/p1-tool-batch-2026-03-09-afternoon/spec.md`
   - Source of truth for exact input keys, output keys, default values, formulas, visible KPIs, detail rows, and overlap constraints.
3. `specs/p1-tool-batch-2026-03-09-afternoon/plan.md`
   - Confirms browser-free verification path with `curl` + `node` extraction of `compute(v)`.
4. `specs/p1-tool-batch-2026-03-09-afternoon/test-cases.md`
   - Provides deterministic baseline fixture and Google Play edge case for break-even `0`.
5. `tools/app-store-net-revenue-calculator/index.html`
   - Reuse target for EastSea calculator shell: bilingual header, responsive two-card layout, summary textarea, copy/reset actions, and live render loop.
6. `tools/google-play-net-revenue-calculator/index.html`
   - Existing draft already present in working tree; reviewed against spec instead of rebuilding from scratch.
7. `tools/manifest.json` and `_data/tools-list.json`
   - Confirmed discovery/catalog entries already exist in working tree and need final size accuracy plus verification.

## Findings
- A near-complete draft page already existed and matched the required formula contract.
- The draft includes the mandatory `TESTABLE_COMPUTE` markers and the required input/output keys.
- The catalog already contains the slug, but `manifest.json` size metadata must reflect the actual shipped file size.
- No Google Play overlap terms like `MAU`, `ARPDAU`, or `battle pass` are needed in MVP and should stay excluded.

## Scope for this slice
- Keep edits surgical.
- Preserve the current static single-file implementation under `tools/google-play-net-revenue-calculator/index.html`.
- Verify baseline math, metadata smoke checks, overlap guard, and break-even edge case.
- Write verification evidence to `tmp/`.
- Update only minimal catalog metadata required for this slug.
