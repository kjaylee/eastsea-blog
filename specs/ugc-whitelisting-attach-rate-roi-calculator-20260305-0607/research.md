# Research — ugc-whitelisting-attach-rate-roi-calculator

## Goal
Ship one **new** monetization calculator that estimates ROI/profit from increasing UGC ad-whitelisting attach rate.

## Existing patterns reviewed
1. `tools/api-credit-pack-breakage-roi-calculator/{index.html,app.mjs,logic.mjs}`
   - Pattern: validated numeric inputs, deterministic ROI outputs, summary text, reset/copy UX.
2. `tools/ugc-creator-package-pricing-calculator/logic.mjs`
   - Pattern: UGC-specific variables and practical pricing assumptions.
3. `tools/index.html`, `tools/index.md`, `scripts/build-manifests.sh`
   - Pattern: add discovery card + markdown list entry, regenerate `tools/manifest.json` from folder index titles.

## Product angle
- Teams/agencies often under-monetize creator whitelisting rights.
- A fast attach-rate model is practical for deciding whether sales enablement/legal templates/process investment is worth it.

## Scope
- New slug: `tools/ugc-whitelisting-attach-rate-roi-calculator/`
- Deliverables: `index.html`, `app.mjs`, `logic.mjs`, plus unit test.
- Outputs: incremental whitelisting deals, monthly net benefit, period net benefit, ROI, payback, break-even target attach rate.
- Repo wiring: `tools/index.html`, `tools/index.md`, `tools/manifest.json`.

## Risks and mitigations
- Overlap risk with existing UGC pricing tool.
  - Mitigation: focus this tool on **attach-rate uplift ROI**, not quote building.
- Invalid assumptions causing unstable output.
  - Mitigation: bounded validation + finite checks + non-finite fallback labels.
- Mobile readability risk.
  - Mitigation: responsive grid collapsing to single-column under 940px.
