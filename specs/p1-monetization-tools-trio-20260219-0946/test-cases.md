# Test Cases — P1 Monetization Tools Trio (20260219-0946)

## Common Validation
- **TC-COM-01**: required numeric inputs blank/NaN -> show validation error, no crash
- **TC-COM-02**: percent fields out of range (<0 or >100) -> block calculation with KR error
- **TC-COM-03**: copy summary button -> clipboard success or graceful fallback alert

---

## Tool A — SaaS Expansion MRR Waterfall Calculator

### Functional
- **TC-A-01 (baseline)**
  - Input: starting 120,000, new 18,000, expansion 12%, contraction 4%, churn 3%, reactivation 2,500
  - Expected:
    - expansion = 14,400
    - contraction = 4,800
    - churn = 3,600
    - ending = 146,500
    - net new = 26,500
    - NRR = (120000+14400-4800-3600)/120000 = 105.00%
    - GRR = (120000-4800-3600)/120000 = 93.00%
- **TC-A-02 (zero starting MRR)**
  - starting = 0 -> validation error (NRR/GRR undefined guard)
- **TC-A-03 (high churn stress)**
  - churn 40% with low expansion -> status should indicate contraction risk (negative/low net new)

### UX
- **TC-A-04** mobile width 390px -> two-column sections collapse cleanly

---

## Tool B — E-commerce Contribution Margin Stack Calculator

### Functional
- **TC-B-01 (baseline)**
  - Input: orders 4,500, AOV 52,000, COGS 39%, payment fee 2.9%, fulfillment 2,300, shipping subsidy 1,400, return rate 6%, return processing 4,500, ad 21,000,000, fixed 13,000,000
  - Expected intermediate:
    - GMV = 234,000,000
    - returns value = 14,040,000
    - net sales = 219,960,000
    - cogs = 91,260,000
    - payment fees ≈ 6,378,840
    - fulfillment = 10,350,000
    - shipping subsidy = 6,300,000
    - return processing = 1,215,000
    - variable cost total ≈ 115,503,840
    - contribution profit = 219,960,000 - 115,503,840 - 21,000,000 - 13,000,000 = 70,456,160
- **TC-B-02 (zero orders)**
  - orders = 0 -> validation error
- **TC-B-03 (break-even AOV)**
  - if contribution <=0, break-even AOV should still compute finite when denominator positive; otherwise N/A

### UX
- **TC-B-04** status badge color changes by profit sign (positive/warn/loss)

---

## Tool C — Revenue-based Financing Cost Calculator

### Functional
- **TC-C-01 (baseline)**
  - Input: financing 80,000,000; factor 1.32; revenue share 8%; monthly revenue 42,000,000; growth 2%; minimum payment 1,800,000
  - Expected:
    - total payback = 105,600,000
    - monthly simulated payments decrease/increase by revenue trend with min floor
    - repayment months finite (typically < 40 for baseline)
    - estimated APR is finite positive
- **TC-C-02 (minimum payment binding)**
  - small revenue + min payment high -> monthly payment should equal minimum for early periods
- **TC-C-03 (zero/negative financing)**
  - financing <= 0 -> validation error
- **TC-C-04 (IRR guard)**
  - if numerical IRR cannot converge, output should show `N/A` without JS crash

### UX
- **TC-C-05** schedule table displays at least first 12 months and final month summary

---

## Integration Cases
- **TC-I-01** new cards appear in `tools/index.html` and are searchable.
- **TC-I-02** `tools/manifest.json` count increases by +3 and includes three new slugs.
- **TC-I-03** `_data/tools-list.json` includes three new URLs.
- **TC-I-04** local serve URLs return 200.
- **TC-I-05** live URLs return 200 after deploy.
