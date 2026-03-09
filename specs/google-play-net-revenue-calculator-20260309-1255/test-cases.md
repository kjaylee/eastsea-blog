# Test Cases — google-play-net-revenue-calculator

## Functional
- TC-F001: page contains `<title>`, `/assets/analytics.js`, `Back to Portal`, and `TESTABLE_COMPUTE` markers
- TC-F002: 8 numeric inputs are present with the exact spec keys
- TC-F003: summary textarea is populated after render
- TC-F004: invalid rate input should trigger visible validation and KPI reset

## Formula
- TC-L001 baseline fixture
  - `playNetProceeds = 89481.81818181818`
  - `totalNetRevenue = 107481.81818181818`
  - `monthlyNetProfit = 69481.81818181818`
  - `netMarginPct = 57.90151515151515`
  - `breakEvenGrossBillingsInclTax = 26821.091130752826`
- TC-L002 ad-covered edge case
  - input: `grossBillingsInclTax=50000, taxRate=10, refundRate=5, playFeeRate=15, adRevenue=40000, uaSpend=12000, backendCost=8000, fixedCost=5000`
  - expected: `breakEvenGrossBillingsInclTax = 0`

## Scope / overlap
- TC-S001: page must not contain `MAU`, `DAU/MAU`, `ARPDAU`, `ARPPU`, or `battle pass`
- TC-S002: catalog files include `/tools/google-play-net-revenue-calculator/`
