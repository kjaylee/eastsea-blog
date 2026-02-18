# Test Cases — P1 Monetization Tools Trio (05:09)

## A. Structural / Contract
1. `tools/influencer-campaign-roas-calculator/index.html` exists.
2. `tools/wholesale-margin-pricing-calculator/index.html` exists.
3. `tools/upsell-conversion-profit-calculator/index.html` exists.
4. Each new tool is single-file and self-contained (inline CSS/JS).
5. Each page contains a Back to Portal anchor with `href='/'` or `href="/"`.
6. `tools/manifest.json` includes all 3 new URLs.
7. `_data/tools-list.json` includes all 3 new URLs.

## B. Validation Behavior
1. Negative currency/cost/order values must surface an error and suppress KPI output.
2. Percentage values outside 0–100 must surface an error.
3. Division-by-zero paths (e.g., zero clicks, zero margin denominator) must not crash and should show safe fallback text.
4. Impossible target states (e.g., target margin >= available post-fee ratio) should show explicit validation errors.

## C. Formula Spot Checks
1. Influencer ROAS:
   - If net revenue is 1,000,000 and spend is 250,000, ROAS = 4.00x.
2. Wholesale pricing:
   - If expected net profit is 120,000 on order revenue 600,000, margin = 20%.
3. Upsell conversion:
   - If monthly net upsell profit is 300,000 and one-time setup cost is 900,000, payback = 3.0 months.

## D. Deployment Verification
1. `curl -I https://eastsea.monster/tools/influencer-campaign-roas-calculator/` returns HTTP 200.
2. `curl -I https://eastsea.monster/tools/wholesale-margin-pricing-calculator/` returns HTTP 200.
3. `curl -I https://eastsea.monster/tools/upsell-conversion-profit-calculator/` returns HTTP 200.
