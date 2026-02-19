# Test Cases — p1-monetization-tools-trio-20260219-1400

## A) App Store Net Revenue Calculator

### A-1 Normal scenario
- installs 120000
- paid conversion 2.8%
- monthly price 9900
- paid months 7
- store fee 15%
- VAT 10%
- refund 4.2%
- infra/support 1200
- CPI 1800
- one-time 25000000
- Expected:
  - paid users, net proceeds, cohort net profit are finite numbers
  - break-even conversion rate is computed and displayed as percentage

### A-2 Invalid rates
- conversion < 0 or > 100
- fee/refund/VAT outside 0~100
- Expected: validation error box + KPI reset

### A-3 Impossible break-even
- per-paid-user contribution <= 0
- Expected: break-even conversion shows “달성 불가 / Not achievable”

---

## B) Podcast Sponsorship Revenue Calculator

### B-1 Normal scenario
- episodes 12
- downloads 38000
- slots 2
- fill rate 72%
- CPM 52000
- premium 1.2
- fee 18%
- prod cost 850000
- monthly opex 4200000
- months 12
- one-time 9000000
- Expected:
  - monthly gross/net revenue, monthly net profit, period net impact are finite
  - break-even CPM and break-even fill rate are computed

### B-2 Invalid numeric range
- episodes <= 0, downloads <= 0, months <= 0
- fill/fee outside 0~100
- Expected: validation error + output reset

### B-3 Low-demand stress case
- very low downloads/fill with high costs
- Expected: monthly net negative and warning status 표시

---

## C) Subscription Downgrade Prevention ROI Calculator

### C-1 Normal scenario
- at-risk 24000
- baseline downgrade 11%
- improvement 22%
- premium arpu 29000
- downgraded arpu 13000
- gross margin 72%
- retained months 5
- campaign cost 900
- fixed monthly 4500000
- one-time 18000000
- months 10
- Expected:
  - prevented downgrades, preserved MRR/GP, monthly net impact, ROI finite
  - payback and break-even improvement are calculated

### C-2 Invalid economics
- premium ARPU <= downgraded ARPU
- retained months <= 0
- Expected: validation error

### C-3 Impossible break-even
- denominator <= 0 in break-even equation
- Expected: break-even improvement shows “달성 불가 / Not achievable”

---

## D) Integration checks
1. `tools/index.html`에 신규 3개 카드 존재
2. `tools/manifest.json`에 신규 3개 slug 존재
3. `_data/tools-list.json`에 신규 3개 URL 존재
4. 로컬 HTTP 200:
   - `/tools/app-store-net-revenue-calculator/`
   - `/tools/podcast-sponsorship-revenue-calculator/`
   - `/tools/subscription-downgrade-prevention-roi-calculator/`
5. 라이브 GitHub Pages URL 3개 HTTP 200 확인
