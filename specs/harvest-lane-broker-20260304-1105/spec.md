# Spec — harvest-lane-broker

## Product intent
밝은 톤 모바일 우선 하이브리드 게임 슬라이스를 제작한다. 실시간 레인 회피 + 상자 병합 성장 + 계약 경제를 결합한다.

## Core loop
1. 런 시작 후 3레인에서 카트를 좌우 이동.
2. 상자 토큰(T1~T4)을 수집하고 까마귀 토큰을 회피.
3. 런 종료 시 수집량/규칙에 따라 코인·젬 정산.
4. 도크에서 동일 티어 상자 병합.
5. 다음 런 계약(Street/Brunch/Export) 선택.

## Mechanics (2+)
- **A. Real-time lane survival**: 실시간 좌우 이동 + 충돌 판정.
- **B. Merge progression**: 동일 티어 2개 병합.
- **C. Contract economy**: 계약 비용(코인/젬)과 수익 배율.
- **Unique. Variety Dividend**:
  - T1/T2/T3를 모두 수집 시 정산 배율 `x1.22`.
  - 한 티어가 70% 이상 점유(최소 4개 수집) 시 `x0.78` 패널티.

## Economy
- `runValue += tier * 14`
- `deckMultiplier = 1 + tierPoints(inventory)`
- `payout = runValue * deckMultiplier * contractMultiplier * diversityMultiplier * crashMultiplier`
- 계약:
  - street: free, x1.0
  - brunch: 50 coins, x1.25
  - export: 3 gems, x1.5

## Constraints
- 리듬 요소 없음 (BPM/비트 타이밍 없음)
- neon dark 톤 금지 (밝은 배경 + 따뜻한 팔레트)
- 모바일 우선 UI
- 외부 API 의존 없음

## Persistence
- key: `harvest_lane_broker_save_v1`
- save: day, coins, gems, totalRevenue, bestPayout, inventory
