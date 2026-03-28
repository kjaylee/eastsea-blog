# Gap Analysis — 2026-03-28 Tool Catalog Sync

## Closed in this slice
- manifest count drift
- missing manifest slug drift
- missing tools-list entry drift
- stale landing-page count copy / JSON-LD count drift
- most blank/generic/suspicious tools-list metadata via automatic repair

## Remaining gaps
1. **21 tool pages still miss `/assets/analytics.js`**
   - deterministic next cleanup slice
   - already isolated by `tool-catalog-guard.py`
2. **Generated description quality is functional, not editorial**
   - the reconciler now guarantees non-blank/safe metadata, but not handcrafted copy quality
3. **Broader repo verification still has a novels-manifest issue**
   - unrelated to the tool catalog work
   - missing file: `novels/_data/카페사장님은전생자입니다-010.md`

## Recommended next step
Use the guard’s only remaining warning bucket as the next P1 repair batch: add `/assets/analytics.js` to the 21 affected tool pages and re-run `tool-catalog-guard.py` to chase a fully clean catalog audit.
