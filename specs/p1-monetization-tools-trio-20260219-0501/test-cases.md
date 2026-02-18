# Test Cases — P1 Monetization Tools Trio

## A. Structural / Contract
1. **File existence**
   - `tools/breakeven-roas-calculator/index.html` exists.
   - `tools/subscription-price-increase-impact-calculator/index.html` exists.
   - `tools/conversion-funnel-revenue-forecast/index.html` exists.
2. **Single-file rule**
   - Each tool folder contains only `index.html` (no external JS/CSS dependency required).
3. **Portal compatibility**
   - Each HTML contains a Back to Portal anchor with `href='/'` or `href="/"`.
4. **Manifest/list updates**
   - `tools/manifest.json` includes all 3 tool URLs.
   - `_data/tools-list.json` includes all 3 tool URLs.

## B. Validation
1. Negative monetary inputs should display error and suppress KPI rendering.
2. Rate inputs outside 0–100 should display error.
3. Zero divisor scenarios (e.g., clicks=0 with CPC output) should avoid crash and show safe fallback (0 or N/A).

## C. Calculator correctness (spot checks)
1. **Break-even ROAS**
   - Given AOV=100000, margin=60% -> break-even ROAS = 1 / 0.6 = 1.6667x.
2. **Subscription price impact**
   - With 1000 users, price 10000, +10% increase, churn delta +2%p:
     - next users = 1000 × (1 - (baseline+delta)/100)
     - compare before vs after MRR and gross profit.
3. **Funnel forecast**
   - Stage counts are chained by percentages and match displayed revenue/orders.

## D. Deployment verification
1. `curl -I https://eastsea.monster/tools/breakeven-roas-calculator/` returns HTTP 200.
2. `curl -I https://eastsea.monster/tools/subscription-price-increase-impact-calculator/` returns HTTP 200.
3. `curl -I https://eastsea.monster/tools/conversion-funnel-revenue-forecast/` returns HTTP 200.
