# Test Cases — p1-monetization-tools-trio-20260219-1700

## A) YouTube Membership Break-even Calculator

### A-1 Normal scenario
- Inputs:
  - subscribers 120,000
  - new-member conversion 0.35%
  - membership price 6,900 KRW
  - creator share 70%
  - churn 8%
  - perk cost/member 1,100 KRW
  - fixed monthly cost 2,400,000 KRW
  - setup 9,000,000 KRW
  - period 12 months
- Expected:
  - ending active members > new members/month
  - latest monthly net is numeric
  - period net/ROI/payback computed deterministically

### A-2 Invalid rate bounds
- churn > 100 or share <= 0
- Expected: validation error appears, KPI outputs reset

### A-3 Impossible member economics
- `price*share <= perk cost/member`
- Expected: break-even members shows “달성 불가 / Not feasible” and warning status

---

## B) Creator Course Launch Profit Calculator

### B-1 Normal scenario
- Inputs:
  - audience 80,000
  - opt-in 14%
  - conversion 3.6%
  - price 390,000 KRW
  - payment fee 3.3%
  - refund 7%
  - affiliate payout 18%
  - support/student 16,000 KRW
  - ad spend/launch 14,000,000 KRW
  - production 28,000,000 KRW
  - cycles 3
- Expected:
  - leads/students/gross sales are positive
  - per-launch profit and total net are numeric
  - break-even conversion is computed

### B-2 Invalid input
- audience <= 0, cycles = 0, refund >= 100
- Expected: validation blocks calculation

### B-3 Contribution negative case
- high fee+refund+affiliate with high support cost
- Expected: break-even conversion becomes “달성 불가 / Not feasible”

---

## C) Affiliate Network vs In-house Profit Calculator

### C-1 Normal scenario
- Inputs:
  - orders 3,200
  - AOV 72,000 KRW
  - margin 46%
  - network commission 18%
  - network fee 4%
  - network loss 2.5%
  - in-house commission 14%
  - in-house loss 1.6%
  - software 2,200,000 KRW/month
  - manager 4,800,000 KRW/month
  - setup 19,000,000 KRW
  - period 12 months
- Expected:
  - network and in-house monthly net are numeric
  - monthly uplift and period net impact computed
  - break-even orders numeric when coefficient positive

### C-2 Invalid percentages
- margin > 100, negative fee/loss rates
- Expected: validation error and KPI reset

### C-3 No linear advantage
- in-house variable burden >= network burden and high fixed costs
- Expected: break-even orders shown as impossible

---

## D) Integration checks
1. `tools/index.html` contains cards linking to:
   - `/tools/youtube-membership-break-even-calculator/`
   - `/tools/creator-course-launch-profit-calculator/`
   - `/tools/affiliate-network-vs-inhouse-profit-calculator/`
2. `_data/tools-list.json` includes all 3 tool URLs.
3. `tools/manifest.json` includes all 3 slugs and count increment.
4. Local `curl` status is 200 for all 3 routes.
5. Live URL checks attempted after push within 2-minute polling window.
