# Test Cases — P1 Monetization Tools Trio

## A. Structure & Responsiveness
1. Open each new tool on desktop and mobile width (< 900px).
   - Expected: cards stack and no horizontal overflow.
2. Inspect file structure.
   - Expected: one `index.html` per tool with inline `<style>` and `<script>`.
3. Verify top navigation link.
   - Expected: exact `href="/"` exists on each page.

## B. Validation
1. Enter negative values on required positive fields.
   - Expected: validation error shown; KPI outputs not rendered.
2. Enter out-of-range percentages (>100 or <0).
   - Expected: readable range error.
3. Enter empty/non-finite values.
   - Expected: graceful rejection with no NaN/Infinity shown in KPI fields.

## C. Calculator Logic
1. **Discount Campaign Profit Lift Calculator**
   - Given traffic, baseline conversion, discount rate, COGS, and ad spend inputs.
   - Expected: campaign revenue/profit, margin, incremental lift, and break-even uplift values are finite and coherent.
2. **Invoice Factoring Cashflow Calculator**
   - Given invoice value, fee rate, advance rate, payment terms, and monthly burn.
   - Expected: immediate cash unlocked, total fee cost, effective APR, and runway extension values calculate correctly.
3. **Channel Mix Unit Economics Calculator**
   - Given paid/organic/referral channel mix, CAC, conversion, ARPU, and margin inputs.
   - Expected: blended CAC, gross profit per customer, payback period, and channel contribution metrics update correctly.

## D. Catalog & Deployment
1. `tools/manifest.json` includes all 3 slugs.
2. `_data/tools-list.json` includes all 3 URLs.
3. Live URL checks for each tool return HTTP 200.