# Spec — Brand Licensing Royalty Profit Calculator

## Goal
Build a new monetization tool that estimates brand licensing royalty profit, cash received, ROI, and break-even sales using minimum guarantee and advance recoupment assumptions. Provide concise copy and a mobile-friendly UI.

## User inputs
- 예상 기간 매출 (KRW)
- 로열티율 (%)
- 최소 보장액 (KRW)
- 에이전트 수수료 (%)
- 미상환 선급금 잔액 (KRW)
- 선급금 회수율 (% of royalty)
- 마케팅/브랜드 지원비 (KRW)
- 법무/관리비 (KRW)
- 운영/관리비 (KRW)

## Calculations
Let:
- `sales = forecastSales`
- `rate = royaltyRate / 100`
- `forecastRoyalty = sales * rate`
- `royaltyDue = max(forecastRoyalty, minimumGuarantee)`
- `agentFee = royaltyDue * (agentCommission / 100)`
- `recoupCap = royaltyDue * (recoupRate / 100)`
- `recouped = min(advanceRemaining, recoupCap)`
- `cashReceived = royaltyDue - agentFee - recouped`
- `totalCosts = marketingCost + legalCost + opsCost`
- `netProfit = cashReceived - totalCosts`
- `roi = totalCosts === 0 ? (netProfit >= 0 ? Infinity : -Infinity) : (netProfit / totalCosts) * 100`
- `advanceLeft = max(advanceRemaining - recouped, 0)`
- `mgGap = max(minimumGuarantee - forecastRoyalty, 0)`
- `effectiveTake = sales > 0 ? (cashReceived / sales) * 100 : 0`

Break-even royalty requirement (`breakEvenRoyalty`):
- If `advanceRemaining <= 0`: `breakEvenRoyalty = totalCosts / (1 - agentCommission)` (denominator must be > 0)
- Else (advance still recouping):
  - Case 1 (advance not fully recouped): `breakEvenRoyalty = totalCosts / (1 - agentCommission - recoupRate)` if denominator > 0 and `breakEvenRoyalty <= advanceRemaining / recoupRate`
  - Case 2 (advance fully recouped): `breakEvenRoyalty = (advanceRemaining + totalCosts) / (1 - agentCommission)` if denominator > 0

Break-even sales:
- If `breakEvenRoyalty` is null or `rate <= 0`, output `N/A`.
- If `breakEvenRoyalty <= minimumGuarantee`, output `MG로 충당` (or 0).
- Else `breakEvenSales = breakEvenRoyalty / rate`.

## Outputs (KPI)
- 로열티 확정액 (royaltyDue)
- 기간 현금 수령액 (cashReceived)
- 순이익 (netProfit)
- ROI (%)
- 손익분기 매출 (breakEvenSales)
- 잔여 선급금 (advanceLeft)

## Output details
- 예상 로열티, 최소 보장 추가분(mgGap), 에이전트 수수료, 회수액, 총 지원비, 유효 테이크율 표시
- 상태 배지: 순이익 음수(개선 필요) / ROI 50% 이상(확장 후보) / 그 외(검토)
- 요약 텍스트 복사 기능

## Content/UX
- 한국어 중심, 짧고 직관적인 설명
- 2열 레이아웃 → 모바일 1열
- CTA: “요약 복사”, “기본값 복원”

## Verification commands (must run)
- `node --check tools/brand-licensing-royalty-profit-calculator/app.mjs`
- `python3 -m http.server 8090` and `curl -I http://localhost:8090/tools/brand-licensing-royalty-profit-calculator/` (expect HTTP 200; use 8090 if 8000 is occupied)
