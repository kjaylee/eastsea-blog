# Test Cases — p1-monetization-tools-trio-20260219-0834

## A) Free Shipping Threshold Profit Calculator

### A-1 Normal scenario
- Inputs:
  - orders 18,000
  - AOV 58,000
  - eligible share current 62%
  - eligible share target 49%
  - conversion impact -2.5%
  - AOV uplift +6%
  - margin 44%
  - shipping fee 3,000
  - shipping cost 3,800
  - monthly cost 1,200,000
  - setup 7,500,000
  - period 12
- Expected:
  - baseline/scenario contribution both numeric
  - monthly net lift deterministic (can be + or -)
  - break-even required AOV uplift computed or “달성 불가”

### A-2 Invalid share
- target eligible share > 100
- Expected: validation error, KPI reset

### A-3 Invalid period
- period = 0
- Expected: validation error

---

## B) Sales Onboarding Ramp ROI Calculator

### B-1 Normal scenario
- Inputs:
  - reps 12
  - current ramp 7 months
  - target ramp 4 months
  - quota 38,000,000
  - attainment 78%
  - margin 71%
  - commission 9%
  - onboarding invest/rep 1,800,000
  - platform/month 2,400,000
  - period 12
- Expected:
  - incremental bookings > 0
  - ROI and payback computed
  - break-even target ramp month reported or “달성 불가”

### B-2 Invalid ramp target
- target ramp >= current ramp
- Expected: validation error

### B-3 Impossible economics
- commission >= margin and high fixed cost
- Expected: monthly net <= 0 and payback “회수 불가” 가능

---

## C) Early Payment Discount APR Calculator

### C-1 Normal scenario
- Inputs:
  - invoice volume 920,000,000
  - current DSO 47
  - target DSO 18
  - discount 2.0%
  - adoption 38%
  - bad debt reduction 0.45%
  - annual financing 11%
  - ops savings 1,000,000
  - monthly program 2,200,000
  - setup 6,000,000
  - period 12
- Expected:
  - discount cost, financing savings, bad debt savings all numeric
  - effective APR shown (>0)
  - break-even adoption computed or “달성 불가”

### C-2 Invalid DSO
- target DSO >= current DSO
- Expected: validation error

### C-3 Invalid rates
- adoption > 100 or discount < 0
- Expected: validation error

---

## D) Integration checks
1. `tools/index.html` has cards linking all 3 slugs.
2. `_data/tools-list.json` includes all 3 URLs.
3. `tools/manifest.json` includes all 3 slugs.
4. Local HTTP checks for 3 routes return 200.
5. Live URLs checked after push (200 expected after deploy propagation).
