# Test Cases — p1-monetization-tools-trio-20260219-1714

## A) Newsletter Paid Upgrade Revenue Calculator

### A-1 Normal scenario
- free subscribers: 240,000
- current paid rate: 2.4%
- target paid rate: 3.1%
- monthly price: 12,000
- churn: 4.5%
- fee: 6%
- variable support: 1,700
- monthly campaign cost: 7,000,000
- setup: 18,000,000
- months: 12
- Expected: incremental paid > 0, monthly net numeric, ROI/payback computed.

### A-2 Validation: target lower than current
- target paid rate < current paid rate
- Expected: error shown, KPI outputs reset.

### A-3 Impossible break-even
- fee very high + variable cost high leading to non-positive unit contribution
- Expected: break-even conversion = not achievable.

---

## B) Creator Merch Profit Calculator

### B-1 Normal scenario
- audience: 180,000
- conversion: 1.8%
- AOV: 46,000
- COGS: 37%
- fulfillment per order: 4,000
- fee: 7.5%
- returns: 6%
- marketing: 22,000,000
- fixed opex: 8,000,000
- months: 6
- Expected: monthly orders/sales/profit numeric and internally consistent.

### B-2 Validation: invalid rate bounds
- conversion > 100 or returns > 100
- Expected: validation error.

### B-3 Low-margin stress
- COGS + fee + return + fulfillment pushes contribution negative
- Expected: monthly net negative, break-even conversion may be not achievable.

---

## C) Subscription Pause Save Revenue Calculator

### C-1 Normal scenario
- at-risk: 32,000
- baseline churn: 18%
- accept: 34%
- reactivate: 58%
- ARPU: 21,000
- gross margin: 72%
- incentive per saved: 2,400
- monthly tool cost: 6,500,000
- setup: 25,000,000
- months: 12
- Expected: saved users > 0, preserved MRR > 0, ROI/payback computed.

### C-2 Validation: margin/rates out of range
- gross margin <= 0, or accept/reactivation > 100
- Expected: validation error.

### C-3 Non-viable unit economics
- incentive per saved exceeds preserved margin contribution
- Expected: break-even accept rate not achievable.

---

## D) Integration checks
1. `tools/index.html` includes links to all 3 slugs.
2. `_data/tools-list.json` includes title/description/url for all 3 tools.
3. `tools/manifest.json` includes all 3 slugs after regeneration.
4. Local route checks return 200 for:
   - `/tools/newsletter-paid-upgrade-revenue-calculator/`
   - `/tools/creator-merch-profit-calculator/`
   - `/tools/subscription-pause-save-revenue-calculator/`
5. Live URLs return 200 within 2 minutes after push.
