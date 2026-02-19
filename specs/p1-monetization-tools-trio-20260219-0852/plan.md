# Plan — P1 Monetization Tools Trio (2026-02-19 08:52)

## Execution Order (mandatory)
1. Spec ✅
2. Plan (this doc)
3. Test cases
4. Tasks
5. Implementation

## Implementation Plan
1. **Scaffold 3 tool directories**
   - `tools/cpq-discount-guardrail-roi-calculator/`
   - `tools/contract-redline-cycle-roi-calculator/`
   - `tools/onboarding-time-to-value-roi-calculator/`

2. **Build single-file responsive calculators**
   - Common layout: header, input panel, KPI panel, summary panel.
   - Real-time recomputation on input changes.
   - Validation guardrails for percentage bounds and non-negative financial values.

3. **Add robust KPI outputs**
   - Monthly benefit, monthly net impact, annual net impact, ROI, payback months.
   - At least one break-even/target insight per calculator.

4. **Update discovery artifacts**
   - Append 3 cards to `tools/index.html`.
   - Regenerate `tools/manifest.json` via `scripts/build-manifests.sh`.
   - Append 3 metadata entries in `_data/tools-list.json`.

5. **Local verification**
   - Start local static server (repo root).
   - `curl -I` 3 local tool URLs and confirm HTTP 200.

6. **Git commit + push**
   - Stage only task-related files.
   - Commit to `master` in `eastsea-blog`.
   - Push to `origin master`.

7. **Live verification**
   - Poll live URLs until HTTP 200 confirmed for all 3.

8. **Checkpoint persistence at each step**
   - Write step artifacts under `.state/p1-monetization-tools-trio/20260219-0852/`.
