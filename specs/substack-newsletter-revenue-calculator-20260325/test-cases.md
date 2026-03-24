# Test Cases — Substack Newsletter Revenue Calculator

Notation: money rounded to 2 decimals unless noted.

TC-SN-01 Baseline mixed billing snapshot
- Input: paidSubscribers=1000; annualSharePct=35; monthlyPrice=$8; annualPrice=$80; foundingMembers=20; foundingPrice=$150; refundRatePct=2; platform=10%; processing=2.9% + $0.30; recurring=0.7%.
- Expect:
  - monthlyPaid=650, annualPaid=350
  - grossEq ≈ 5200 + 2333.33 + 250 = 7783.33
  - refundLossEq ≈ 155.67
  - platformFeeEq ≈ 762.77
  - processorVarFeeEq ≈ 221.20
  - recurringFeeEq ≈ 51.68 (applies to monthly+annual only)
  - fixedFeeEq ≈ 204.25 (650×0.30 + 350/12×0.30 + 20/12×0.30)
  - totalFeesExRefundEq ≈ 1239.90
  - netEq ≈ 6387.77
  - effectiveFeeRatePct ≈ 15.93%

TC-SN-02 Derive paid from audience
- Input: derivePaidFromAudience=true; audienceSize=50000; paidConversionRatePct=2; other values equal to baseline.
- Expect: paidSubscribers=1000; results ≈ TC-SN-01.

TC-SN-03 Validation guards
- Negative price or rate>100 rejected; fixed fee < 0 rejected; counts must be integers.

TC-SN-04 HTML + includes
- `index.html` contains `<title>Substack Newsletter Revenue Calculator` and `/assets/analytics.js`, and `script defer src="./calculator.js"`.

TC-SN-05 Discovery exact-once wiring
- `tools/index.html` and `tools/index.md` contain exactly one occurrence of slug `substack-newsletter-revenue-calculator`.
- `_data/tools-list.json` already contains exactly one `/tools/substack-newsletter-revenue-calculator/` entry.
- `tools/manifest.json` contains exactly one entry with slug and canonical url.
