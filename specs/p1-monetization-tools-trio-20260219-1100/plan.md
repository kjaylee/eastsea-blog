# Plan — p1-monetization-tools-trio-20260219-1100

## Execution Plan (SDD/TDD)
1. **Manifest Audit (Done first)**
   - Parse `tools/manifest.json`
   - Validate selected slugs are not present

2. **Spec Artifacts**
   - Create `spec.md`, `plan.md`, `test-cases.md`, `tasks.md`

3. **Implementation**
   - Build 3 standalone calculators:
     - `saas-proration-revenue-leakage-calculator`
     - `ecommerce-coupon-stack-margin-guardrail-calculator`
     - `fintech-interchange-vs-reward-spend-calculator`
   - Ensure responsive layout + KO/EN toggle + copy-summary
   - Ensure portal link uses `href="/"`

4. **Catalog Integration**
   - Add 3 cards to `tools/index.html`
   - Update `tools/manifest.json`
   - Update `_data/tools-list.json`

5. **Verification**
   - Start local server: `python3 -m http.server`
   - `curl` local URLs for 200 + keyword checks

6. **Release**
   - Stage only intended files
   - Commit in `eastsea-blog/`
   - Push `master`

7. **Live Validation**
   - Verify `https://eastsea.monster/tools/{slug}/` = HTTP 200
   - Retry until deployment reflects commit

## Risks & Mitigations
- **Risk**: Existing dirty working tree in repo.
  - **Mitigation**: `git add` with explicit file list only.
- **Risk**: Manifest count mismatch.
  - **Mitigation**: recalculate `count` from actual tool list after append.
- **Risk**: GH Pages deploy lag.
  - **Mitigation**: polling with `curl` and short wait loop.

## Definition of Done
- 3 new tools added and usable
- all required index/manifest/data files updated
- local + live HTTP 200 verified
- checkpoint JSON per step saved