# Test Cases — P1 Monetization Tools Trio

## A. Structure & Responsiveness
1. Open each new tool on desktop and narrow viewport (< 900px).
   - Expected: Layout stacks cleanly, no horizontal overflow, controls remain usable.
2. Inspect source for each tool.
   - Expected: Single-file `index.html` with inline `<style>` and `<script>`.
3. Check Back link.
   - Expected: Anchor exists with exact `href='/'`.

## B. Validation Behavior
1. Enter negative numbers in required monetary fields.
   - Expected: Validation error, no KPI computation.
2. Enter percentages outside 0–100 where constrained.
   - Expected: Error message shown.
3. Enter blank/non-finite values (`NaN`, huge exponent style copy/paste cases).
   - Expected: Graceful rejection with readable message.

## C. Calculator Logic
1. **Ad RPM Optimizer**
   - Given positive traffic/CTR/CPC/CPM inputs
   - Expected: Impressions, clicks, revenue, RPM, and target gap values update consistently.
2. **Bundle Pricing Profit Calculator**
   - Given product prices/costs, discount, orders, fee/tax/fixed-cost inputs
   - Expected: Bundle price, net profit, margin, contribution/order, break-even orders computed.
3. **Subscription Churn Recovery Calculator**
   - Given churn/save rates and forecast horizon
   - Expected: With-recovery scenario shows monthly table plus incremental subscribers/revenue/net benefit.

## D. Catalog & Deploy
1. `tools/manifest.json` contains the 3 slugs:
   - `ad-rpm-optimizer`
   - `bundle-pricing-profit-calculator`
   - `subscription-churn-recovery-calculator`
2. `_data/tools-list.json` contains the 3 URLs.
3. Production URL checks after push return HTTP 200 for all 3 paths.
