# Spec — In-app Tip Jar Profit Calculator

## Goal
Create a new monetization tool that estimates monthly tip-jar profit, ROI, and payback for in-app/creator tip features. Provide concise copy, mobile-friendly UI, and a shareable summary.

## User inputs
- 월간 활성 사용자 (MAU)
- 팁 노출률 (%)
- 팁 전환율 (%)
- 1인당 월 평균 팁 횟수
- 평균 팁 금액 (KRW)
- 플랫폼 수수료 (%)
- 결제 처리 수수료 (%)
- 결제 고정 수수료 (KRW/건)
- 월 운영비 (KRW)
- 1회 구축비 (KRW)

## Calculations
Let:
- `exposure = MAU * exposureRate`
- `tippers = exposure * conversionRate`
- `transactions = tippers * tipsPerTipper`
- `gross = transactions * avgTip`
- `variableFees = gross * (platformFee + paymentFee)`
- `fixedFees = transactions * fixedFee`
- `netRevenue = gross - variableFees - fixedFees`
- `monthlyNet = netRevenue - monthlyCost`
- `annualROI = ((monthlyNet * 12) - implementationCost) / implementationCost * 100`
- `paybackMonths = implementationCost / monthlyNet` (only if monthlyNet > 0)
- `netPerTip = avgTip * (1 - (platformFee + paymentFee)) - fixedFee`
- `breakEvenConversion = monthlyCost / (MAU * exposureRate * tipsPerTipper * netPerTip)` (if denominator > 0)

## Outputs (KPI)
- 월 총 팁 매출
- 월 순매출 (수수료 반영)
- 월 순이익
- 연간 ROI
- 회수기간(개월)
- 손익분기 전환율

## Output details
- 팁 사용자 수, 팁 거래 건수, 총 수수료, 순팁 단가 표시
- 상태 배지: 수익성/개선 필요 판단
- 요약 텍스트 복사 기능

## Content/UX
- 한국어 중심, 짧고 직관적인 설명
- 2열 레이아웃 → 모바일 1열
- CTA: “요약 복사”, “기본값 복원”

## Verification commands (must run)
- `node --check tools/in-app-tip-jar-profit-calculator/app.mjs`
- `python3 -m http.server 8000` and `curl -I http://localhost:8000/tools/in-app-tip-jar-profit-calculator/` (expect HTTP 200)
