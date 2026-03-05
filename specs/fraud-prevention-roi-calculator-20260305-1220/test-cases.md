# Test Cases — Fraud Prevention ROI Calculator

## Functional
1. **Baseline calculation**
   - Input: orders 12000, AOV 58000, fraudRate 1.2, chargebackFee 25000, blockRate 60, falsePositiveRate 0.4, grossMargin 45, monthlyCost 3000000, setupCost 8000000, months 12
   - Expect: All KPIs render (no dashes), monthly net impact positive/negative depending on inputs, summary populated.

2. **Zero fraud scenario**
   - fraudRate = 0
   - Expect: baseline loss 0, prevented loss 0, remaining loss 0, break-even shows “사기 주문 없음”.

3. **High false positive rate**
   - falsePositiveRate = 5, grossMargin = 60
   - Expect: false positive loss increases; monthly net impact can turn negative.

4. **Payback not reachable**
   - Use high monthlyCost + low blockRate
   - Expect: payback shows “회수 불가”.

## Validation
5. **Invalid orders**
   - orders = 0
   - Expect: error banner “월 주문 수와 분석 기간은 1 이상…” and all outputs cleared.

6. **Invalid percentages**
   - blockRate = 150
   - Expect: error banner for rate range and outputs cleared.

7. **Negative cost**
   - monthlyCost = -100
   - Expect: error banner for cost >= 0.

## UX
8. **Mobile layout**
   - View width < 860px
   - Expect: grid collapses to single column, inputs stacked.

9. **Copy summary**
   - Click “요약 복사”
   - Expect: clipboard copy success alert.
