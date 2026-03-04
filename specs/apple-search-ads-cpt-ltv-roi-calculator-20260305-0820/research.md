# Research — apple-search-ads-cpt-ltv-roi-calculator

## Goal
Ship one **new** monetization tool for iOS teams to estimate campaign profitability from Apple Search Ads using CPT and subscription LTV.

## Existing patterns reviewed
1. `tools/api-minimum-commit-overage-profit-calculator/{index.html,script.js}`
   - Pattern: responsive two-column KPI layout, concise Korean copy, summary copy button.
2. `tools/mobile-ad-frequency-cap-roi-calculator/index.html`
   - Pattern: monetization-focused ROI framing with break-even and payback indicators.
3. `tools/index.html`, `tools/index.md`, `scripts/build-manifests.sh`
   - Pattern: add discovery card + markdown entry, regenerate `tools/manifest.json` from directory scan.

## Product angle
- Apple Search Ads often uses CPT bidding while teams monetize via subscriptions.
- Practical decision requires funnel conversion + LTV + operating cost in one calculator.

## Scope
- New slug: `tools/apple-search-ads-cpt-ltv-roi-calculator/`
- Deliverables: `index.html`, `script.js`.
- Outputs: paid conversions, net LTV per paid user, monthly net profit, period net, ROI, payback, break-even CPT, break-even trial-to-paid rate.
- Wiring: `tools/index.html`, `tools/index.md`, `tools/manifest.json`.

## Risks and mitigations
- Formula confusion between LTV and monthly profit.
  - Mitigation: explicit labels and validation with finite fallbacks.
- Mobile readability risk.
  - Mitigation: responsive collapse to single-column below 920px.
