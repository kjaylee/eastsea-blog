# Test Cases — p1-monetization-tools-trio-20260219-0844

## A) Deferred Revenue Recognition Calculator

### A-1 Normal scenario
- Inputs:
  - contracts/month 90
  - ACV 4,200,000
  - term 12
  - cancellation 7%
  - COGS 28%
  - billing fee 1.8%
  - period 18
  - one-time cost 26,000,000
- Expected:
  - monthly recognized revenue rises through month 12 then stabilizes
  - deferred ending balance positive and numeric
  - ROI and break-even contracts are deterministic numeric values

### A-2 Invalid term
- term = 0
- Expected: validation error shown, KPI outputs reset

### A-3 Impossible break-even case
- cancellation = 100 or COGS >= 100
- Expected: break-even contracts shows “달성 불가” or validation block

---

## B) Sales Commission Accelerator Calculator

### B-1 Normal scenario
- Inputs:
  - team 14
  - quota/rep 160,000,000
  - bookings/rep 198,000,000
  - base 6%
  - threshold 100%
  - accelerator 11%
  - cap 160%
  - margin 68%
  - SPIFF 22,000,000
  - periods 4
- Expected:
  - attainment > 100%
  - accelerator payout component > 0
  - post-commission gross profit numeric
  - break-even required bookings per rep computed

### B-2 Invalid threshold
- threshold < 50 or > 200
- Expected: validation error and KPI reset

### B-3 Margin stress
- margin near base/accelerator burden with high spiff
- Expected: post-commission GP can be <= 0 and status indicates warning

---

## C) Price Localization Margin Calculator

### C-1 Normal scenario
- Inputs:
  - base price 59,000 KRW
  - FX 0.00072 (USD per KRW)
  - rounding unit 0.99
  - VAT 10%
  - marketplace fee 15%
  - payment fee 3.2%
  - refund 4.5%
  - COGS 34%
  - local support cost 1.4
  - target margin 20%
- Expected:
  - recommended local list price numeric and rounded
  - realized margin and margin gap computed
  - required list price for target margin computed

### C-2 Invalid FX/rates
- FX <= 0, VAT > 100, target margin >= 100
- Expected: validation error

### C-3 Impossible economics
- fee + refund + COGS excessively high
- Expected: required price may be “달성 불가” and warning status shown

---

## D) Integration checks
1. `tools/index.html` includes links to all 3 slugs.
2. `_data/tools-list.json` includes title/description/url entries for 3 slugs.
3. `tools/manifest.json` includes the 3 slugs.
4. Local route checks return 200:
   - `/tools/deferred-revenue-recognition-calculator/`
   - `/tools/sales-commission-accelerator-calculator/`
   - `/tools/price-localization-margin-calculator/`
5. Live URL checks attempted after push and final status recorded.
