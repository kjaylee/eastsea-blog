# Spec — Extended Warranty Attach Rate Profit Calculator

## Goal
Provide a practical, mobile-friendly ROI/profit calculator for extended warranty (product protection) attach-rate improvements at checkout. Calculate incremental profit, ROI, payback period, and break-even target attach rate.

## Inputs
1. 월 주문 수 (ordersPerMonth)
2. 현재 보증 플랜 부착률 (%) (currentAttachRate)
3. 목표 보증 플랜 부착률 (%) (targetAttachRate)
4. 보증 플랜 가격 (₩) (planPrice)
5. 예상 클레임/보상 원가율 (%) (claimRate)
6. 환불률 (%) (refundRate)
7. 결제/플랫폼 수수료율 (%) (paymentFeeRate)
8. 계약당 운영비 (₩) (opsCostPerContract)
9. 월 고정 운영비 (₩) (monthlyFixedCost)
10. 초기 구축비 (₩) (setupCost)

## Core calculations
- Attach uplift = max(targetAttachRate - currentAttachRate, 0)
- Incremental contracts = ordersPerMonth * (uplift / 100)
- Gross revenue = incremental contracts * planPrice
- Refunds = gross revenue * (refundRate / 100)
- Net revenue = gross revenue - refunds
- Claim cost = gross revenue * (claimRate / 100)
- Payment fee = net revenue * (paymentFeeRate / 100)
- Ops cost = incremental contracts * opsCostPerContract
- Contribution profit = net revenue - claim cost - payment fee - ops cost
- Net profit (monthly) = contribution profit - monthlyFixedCost
- ROI (annual) = (net profit * 12 - setupCost) / (setupCost + monthlyFixedCost * 12) * 100
- Payback (months) = setupCost / max(net profit, 0) if net profit > 0 else N/A
- Contribution per contract = (planPrice * (1 - refundRate/100)) - (planPrice * claimRate/100) - (planPrice * (1 - refundRate/100) * paymentFeeRate/100) - opsCostPerContract
- Break-even incremental contracts = monthlyFixedCost / contribution per contract (if contribution > 0)
- Break-even target attach rate = currentAttachRate + (breakEvenContracts / ordersPerMonth * 100)

## Outputs / KPIs
- 월 순이익 (net profit)
- 연간 ROI
- 회수기간 (months)
- 추가 보증 계약 수
- 순매출 (net revenue)
- 공헌이익 (contribution profit)
- 손익분기 목표 부착률

## UI/UX
- Two-column layout: inputs on left, KPI tiles + details on right.
- Copy summary + reset buttons.
- Validation errors in a visible alert box.
- Status pill: profitability positive/negative.
- Responsive: single-column on ≤ 900px.
- Concise Korean copy with clear labels; include tags in index.

## Non-goals
- No external API calls.
- No backend persistence.
