# Spec — Cross-sell Recommendation ROI Calculator

## Objective
Quantify the profitability of adding cross-sell recommendation widgets by modeling exposure → take rate → net revenue, then presenting ROI, payback, and break-even take rate.

## Target users
- Ecommerce or DTC operators testing cross-sell widgets
- Growth teams evaluating recommendation engine ROI
- Indie merchants comparing tool costs vs profit impact

## Inputs
1. 월 주문수 (monthlyOrders)
2. 기존 AOV (baseAov, KRW)
3. 추천 노출률 (%) (exposureRate)
4. 크로스셀 부착률 (%) (takeRate)
5. 크로스셀 평균 판매가 (crossSellPrice, KRW)
6. 크로스셀 원가 (crossSellCogs, KRW)
7. 크로스셀 처리비 (fulfillmentCost, KRW)
8. 환불률 (%) (refundRate)
9. 월 툴 비용 (toolCost, KRW)
10. 월 운영/마케팅비 (opsCost, KRW)
11. 초기 셋업비 (setupCost, KRW)
12. 분석 기간 (analysisMonths, months)
13. 목표 회수기간 (targetPaybackMonths, months)

## Outputs (KPIs)
- 월 순크로스셀 매출
- 월 공헌이익
- 월 순이익 (고정비 반영)
- 기간 순이익 (analysisMonths)
- ROI (setupCost 기준)
- 회수기간 (개월)
- AOV 상승분 + 신규 AOV
- 손익분기 부착률 (take rate)

## Calculation logic
- 노출 주문수 = monthlyOrders × exposureRate
- 크로스셀 판매 수량 = 노출 주문수 × takeRate
- 환불 수량 = 판매 수량 × refundRate
- 순매출 = 판매 수량 × 가격 − 환불 수량 × 가격
- 변동비 = 판매 수량 × (원가 + 처리비)
- 공헌이익 = 순매출 − 변동비
- 월 순이익 = 공헌이익 − (toolCost + opsCost)
- 기간 순이익 = 월 순이익 × analysisMonths − setupCost
- ROI = 기간 순이익 ÷ setupCost
- AOV 상승분 = 순매출 ÷ monthlyOrders
- 손익분기 부착률 = 고정비 ÷ (노출 주문수 × 1건당 공헌이익)

## UX requirements
- 2-column layout on desktop, 1-column on mobile.
- Concise copy with short instruction line.
- Summary textarea + copy button.
- Clear KPI cards and detail table.
- LocalStorage for recent inputs.

## Constraints
- Single tool folder under `tools/cross-sell-recommendation-roi-calculator/`.
- No external dependencies; vanilla JS only.
- KRW currency formatting with `ko-KR` locale.
