# Research — battle-pass-attach-rate-roi-calculator

## Goal
Ship one **new** monetization calculator that estimates ROI/profit from improving a battle pass attach rate in a mobile game.

## Existing patterns reviewed
1. `tools/creator-membership-churn-reduction-roi-calculator/{index.html,app.mjs,logic.mjs}`
   - Pattern: validation + ROI outputs + summary copy + localStorage persistence.
2. `tools/mobile-ad-frequency-cap-roi-calculator/index.html`
   - Pattern: concise Korean copy, responsive KPI layout, two-column grid.
3. `tools/index.html`, `tools/index.md`, `scripts/build-manifests.sh`
   - Pattern: add discovery card + markdown list entry, regenerate `tools/manifest.json` from folder index titles.

## Product angle
- Battle pass adoption is a common monetization lever in mobile games.
- A quick attach-rate ROI model helps decide if live-ops or reward-content investment is justified.

## Scope
- New slug: `tools/battle-pass-attach-rate-roi-calculator/`
- Deliverables: `index.html`, `app.mjs`, `logic.mjs`.
- Outputs: incremental buyers, net per buyer, retention value, monthly net lift, period net benefit, ROI, payback, break-even target attach rate.
- Repo wiring: `tools/index.html`, `tools/index.md`, `tools/manifest.json`.

## Risks and mitigations
- Overlap risk with existing pricing/upsell tools.
  - Mitigation: focus on **battle pass attach-rate uplift** with retention value included.
- Invalid assumptions causing unstable output.
  - Mitigation: bounded validation + finite checks + non-finite fallback labels.
- Mobile readability risk.
  - Mitigation: responsive grid collapsing to single-column under 940px.
