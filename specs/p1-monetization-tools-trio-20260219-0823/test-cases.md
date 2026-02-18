# Test Cases — p1-monetization-tools-trio-20260219-0823

## A) Checkout Abandonment Recovery Calculator

### A-1 Normal scenario
- Inputs:
  - checkout starts 20,000
  - abandonment 68%
  - current recovery 9%
  - target recovery 14%
  - AOV 72,000
  - margin 42%
  - incentive/recovered 4,000
  - monthly platform 1,500,000
  - setup 9,000,000
  - period 12 months
- Expected:
  - incremental recovered orders = 680.0
  - monthly incremental revenue = 48,960,000
  - monthly net lift > 0
  - payback finite

### A-2 Invalid target
- target recovery < current recovery
- Expected: validation error shown, KPI outputs reset to "-"

### A-3 Impossible economics
- incentive per recovered order >= AOV × margin
- Expected: break-even target recovery shown as "달성 불가"

---

## B) Referral Program ROI Calculator

### B-1 Normal scenario
- Inputs:
  - active 60,000
  - participation 6%
  - invites/participant 3.2
  - invite→signup 22%
  - signup→paid 18%
  - gross profit per paid referral 280,000
  - reward per paid referral 70,000
  - fraud/ops rate 6%
  - monthly tool 2,200,000
  - setup 14,000,000
  - period 12 months
- Expected:
  - paid referrals/month > 0
  - monthly gross profit > reward+ops cost
  - monthly net lift computed deterministically

### B-2 Zero funnel
- participation = 0%
- Expected: paid referrals = 0, monthly net likely negative from fixed costs

### B-3 Invalid conversion input
- signup→paid > 100%
- Expected: range validation error

---

## C) Upsell Attach Rate Revenue Calculator

### C-1 Normal scenario
- Inputs:
  - base orders 14,000
  - current attach 11%
  - target attach 16%
  - upsell price 39,000
  - discount 12%
  - upsell margin 55%
  - fee rate 3.4%
  - monthly enablement 1,800,000
  - setup 8,500,000
  - period 12 months
- Expected:
  - incremental upsell orders = 700.0
  - incremental upsell revenue > 0
  - monthly net lift > 0

### C-2 Invalid attach range
- target attach > 100%
- Expected: validation error

### C-3 Impossible unit profit
- fee rate >= margin rate
- Expected: break-even attach rate = "달성 불가"

---

## D) Integration checks
1. `tools/index.html` contains links to all 3 slugs.
2. `_data/tools-list.json` contains 3 entries with `/tools/{slug}/` URLs.
3. `tools/manifest.json` includes all 3 slugs.
4. Local server HTTP checks return 200 for all 3 routes.
