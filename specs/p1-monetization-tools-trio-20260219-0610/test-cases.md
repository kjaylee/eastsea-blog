# Test Cases — P1 Monetization Tools Trio

## A. Structure & Responsiveness
1. Open each new tool at desktop width and narrow mobile width (< 900px).
   - Expected: cards stack properly and no horizontal overflow.
2. Inspect each page source.
   - Expected: one `index.html` with inline `<style>` and `<script>`.
3. Check Back link on each tool.
   - Expected: anchor includes exact `href="/"`.

## B. Validation
1. Enter negative values for required positive monetary/order/customer fields.
   - Expected: readable validation error; KPI results suppressed.
2. Enter out-of-range percentages (>100 or below min) where constrained.
   - Expected: validation error shown.
3. Enter empty/non-finite values (`NaN`, `Infinity`, malformed pasted text).
   - Expected: graceful rejection with no broken UI.

## C. Calculator Logic
1. **SaaS LTV:CAC Analyzer**
   - Given valid ARPA, gross margin, churn, CAC, onboarding values.
   - Expected: LTV, blended CAC, ratio, payback period, and target CAC headroom compute consistently.
2. **Refund Rate Profit Impact Calculator**
   - Given valid order, AOV, fee, refund, support, and fixed-cost assumptions.
   - Expected: net revenue, refund losses, net profit, margin, and break-even refund threshold update correctly.
3. **Cohort Retention Revenue Estimator**
   - Given valid cohort, retention, decay, ARPU, and horizon inputs.
   - Expected: monthly cohort table and cumulative revenue/gross/NPV metrics render correctly.

## D. Catalog & Deployment
1. `tools/manifest.json` contains all 3 slugs.
2. `_data/tools-list.json` contains all 3 tool URLs.
3. Production URL checks return HTTP 200 for each new tool path.
