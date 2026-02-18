# Plan — P1 Monetization Tools Trio (2026-02-19 05:09 KST)

1. Finalize SDD/TDD artifacts in strict order: spec → plan → test-cases → tasks.
2. Implement `tools/influencer-campaign-roas-calculator/index.html`:
   - Inputs: impressions, CTR, conversion rate, AOV, gross margin, creator fee, ad boost spend, promo discount.
   - Outputs: clicks, orders, net revenue, gross profit, total spend, ROAS, ROI, break-even orders.
3. Implement `tools/wholesale-margin-pricing-calculator/index.html`:
   - Inputs: wholesale unit price, order units, COGS, pack/fulfillment, shipping, fee %, return %, return loss %, overhead, target margin.
   - Outputs: order revenue, expected costs, net profit, margin %, break-even unit price, target unit price.
4. Implement `tools/upsell-conversion-profit-calculator/index.html`:
   - Inputs: monthly orders, base AOV, attach rate, upsell price, upsell COGS, fulfillment, refund %, monthly tool/ad costs, one-time setup cost.
   - Outputs: upsell units, net upsell revenue, contribution, net monthly profit, AOV lift, break-even attach rate, payback months.
5. Add robust validation and safe fallback states for all calculators.
6. Ensure each tool includes `Back to Portal` link (`href='/'`).
7. Regenerate `tools/manifest.json` (`bash scripts/build-manifests.sh`).
8. Update `_data/tools-list.json` with new tool metadata rows.
9. Run local verification (JSON parse, required href presence, local HTTP 200 checks).
10. Commit and push changes on `master` (repo: `eastsea-blog` only).
11. Verify production URLs return HTTP 200.
