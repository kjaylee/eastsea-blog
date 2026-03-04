# Spec — mobile-ad-frequency-cap-roi-calculator

## Product intent
광고 빈도 캡 조정(노출수 변경) + 리텐션 변화 효과를 동시에 반영해 실제 순이익 관점 의사결정을 지원한다.

## Inputs
- DAU
- 현재/목표 1인당 일 광고 노출수
- eCPM
- Fill rate
- 퍼블리셔 정산율
- 서빙 비용(CPM)
- 리텐션 개선폭(pp)
- 잔존 유저 1인당 월 공헌이익
- 월 운영비, 초기 구축비, 분석기간

## Core formulas
- `k = dau * 30 * (fillRate/100) / 1000`
- `unitMarginCpm = eCPM * (publisherShare/100) - servingCostCpm`
- `currentAdProfit = currentImpressionsPerUserDay * k * unitMarginCpm`
- `targetAdProfit = targetImpressionsPerUserDay * k * unitMarginCpm`
- `adDelta = targetAdProfit - currentAdProfit`
- `retainedUsers = dau * (retentionLiftPp/100)`
- `retentionValue = retainedUsers * grossProfitPerRetainedUser`
- `monthlyNet = adDelta + retentionValue - monthlyProgramCost`
- `periodNet = monthlyNet * months - setupCost`
- `roi = periodNet / (setupCost + monthlyProgramCost*months)`
- `payback = setupCost / monthlyNet` (monthlyNet > 0)
- `breakEvenTargetImpressions = currentImpressionsPerUserDay + (monthlyProgramCost - retentionValue) / (k*unitMarginCpm)`

## UX constraints
- 모바일 우선: 920px 이하 단일 컬럼
- 요약 텍스트 복사 버튼 제공
- 오류 발생 시 KPI clear
