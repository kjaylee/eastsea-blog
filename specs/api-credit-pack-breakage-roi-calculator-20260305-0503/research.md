# Research — api-credit-pack-breakage-roi-calculator

## Goal
Ship one new practical monetization calculator for prepaid API credit-pack economics.

## Existing repo patterns reviewed
1. `tools/premium-support-attach-rate-roi-calculator/logic.mjs`
   - Formula + validation + summary pattern for ROI calculators.
2. `tools/ai-support-deflection-roi-calculator/app.mjs`
   - Live render, localStorage persistence, and copy-summary interaction.
3. `tools/index.html`, `tools/index.md`, `scripts/build-manifests.sh`
   - Required discoverability references (index card, markdown list, manifest generation).

## Product rationale
- API teams increasingly monetize via prepaid credit packs.
- Breakage assumptions can look attractive but easily hide delivery/reserve costs.
- This tool gives a fast decision model before pricing rollout.

## Scope
- New slug: `/tools/api-credit-pack-breakage-roi-calculator/`
- Inputs: adoption baseline/target, credit-unit economics, breakage %, reserve %, support + program costs.
- Outputs: net contribution per buyer, net monthly benefit, period net benefit, ROI, payback, break-even target adoption.
- Include mobile-friendly UI and concise usage copy.
- Integrate manifest/list/index references and add unit tests.
