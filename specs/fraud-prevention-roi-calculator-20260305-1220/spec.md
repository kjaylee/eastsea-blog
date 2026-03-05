# Spec — Fraud Prevention ROI Calculator

## Goal
Create a new monetization tool that quantifies the ROI of fraud-prevention programs by combining avoided fraud losses with false-positive margin loss and operating costs. Deliver a mobile-friendly calculator with concise copy and shareable summary.

## Target users
E-commerce, subscription, or marketplace operators evaluating fraud tooling or rule changes.

## Inputs
1. **월 주문 수 (orders)** — integer > 0
2. **평균 주문 금액 (AOV)** — KRW > 0
3. **사기 주문 비율 (fraudRate %)** — 0–100
4. **차지백 수수료 (chargebackFee)** — KRW ≥ 0 (per fraudulent order)
5. **탐지/차단 성공률 (blockRate %)** — 0–100
6. **정상 주문 오탐율 (falsePositiveRate %)** — 0–100
7. **주문당 기여이익률 (grossMargin %)** — 0–100
8. **월 운영비 (monthlyCost)** — KRW ≥ 0
9. **도입 비용 (setupCost)** — KRW ≥ 0
10. **분석 기간 (months)** — integer ≥ 1

## Core calculations
- fraudOrders = orders * fraudRate / 100
- legitOrders = orders - fraudOrders
- lossPerFraud = AOV + chargebackFee
- baselineLoss = fraudOrders * lossPerFraud
- preventedOrders = fraudOrders * blockRate / 100
- preventedLoss = preventedOrders * lossPerFraud
- remainingLoss = baselineLoss - preventedLoss
- marginPerOrder = AOV * grossMargin / 100
- falsePosOrders = legitOrders * falsePositiveRate / 100
- falsePosLoss = falsePosOrders * marginPerOrder
- monthlyNet = preventedLoss - falsePosLoss - monthlyCost
- totalCost = monthlyCost * months + setupCost
- periodNet = monthlyNet * months - setupCost
- ROI = totalCost > 0 ? (periodNet / totalCost) * 100 : 0
- paybackMonths = monthlyNet > 0 ? setupCost / monthlyNet : Infinity
- breakEvenBlockRate = (fraudOrders > 0 && lossPerFraud > 0)
  ? ((monthlyCost + falsePosLoss) / (fraudOrders * lossPerFraud)) * 100
  : Infinity

## Outputs (KPI)
- 월 사기 손실(기준)
- 월 차단 방어액
- 월 오탐 손실
- 월 순효과
- 기간 순효과
- ROI
- 회수기간
- 손익분기 차단 성공률
- 잔여 사기 손실(차단 후)

## UI/UX
- Two-column grid: inputs left, KPIs + table right.
- Summary textarea with “요약 복사” button.
- Status pill: positive/negative/neutral net impact.
- Responsive: single column under 860px, inputs stacked.

## Validation rules
- Orders and months must be >= 1.
- Monetary fields >= 0 (AOV > 0).
- Rates between 0 and 100.
- If fraudOrders = 0, show break-even as “사기 주문 없음”.

## Copy tone
- Concise, business-focused, KR/EN mixed naming consistent with existing tools.
