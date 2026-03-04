# Spec — orchard-signal-caravan

## Product intent
밝은 톤 모바일 우선 하이브리드 vertical slice. 실시간 레인 회피, 상자 병합 성장, 계약 경제를 결합한다.

## Core loop
1. 런 시작 후 3레인 카트 좌우 이동.
2. 사과 상자(T1~T4) 수집, 늑대 토큰 회피.
3. 런 종료 시 계약/보너스 규칙에 따라 코인·젬 정산.
4. 도크에서 동일 티어 상자 병합.
5. 다음 런 계약(Village/Guild/Royal) 선택.

## Mechanics (2+)
- **A. Real-time lane survival**: 좌우 이동 + 충돌 판정 + 내구도.
- **B. Merge progression**: 동일 티어 2개 병합.
- **C. Contract economy**: 계약 비용(코인/젬)과 수익 배율.
- **Unique. Signal Chain Dividend**:
  - 티어 수집 히스토리에서 연속 `1→2→3` 패턴 성립 시 `x1.24`.
  - 동일 티어 3연속 수집 시 `x0.79` 패널티.

## Economy
- `runValue += tier * 13`
- `deckMultiplier = 1 + tierPoints(inventory)`
- `payout = runValue * deckMultiplier * contractMultiplier * chainMultiplier * crashMultiplier`
- 계약:
  - village: free, x1.0
  - guild: 60 coins, x1.3
  - royal: 3 gems, x1.56

## Constraints
- 리듬 요소 없음(BPM/타이밍 판정 없음)
- neon dark 금지(밝은 배경 + 파스텔 팔레트)
- 모바일 우선 조작(버튼 + 터치)
- 외부 API 의존 없음

## Persistence
- key: `orchard_signal_caravan_save_v1`
- save: day, coins, gems, totalRevenue, bestPayout, inventory
