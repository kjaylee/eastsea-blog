# Spec — sunlit-buoy-forge

## Product intent
밝은 톤 모바일 우선 하이브리드 vertical slice. 실시간 레인 파일럿, 부표 코어 병합 성장, 차터 경제를 결합한다.

## Core loop
1. 도크에서 차터를 선택하고 런 시작.
2. 4레인 항로에서 암초를 피하고 코어(T1~T4) 수집.
3. `Wake Echo Draft` 조건 충족 시 다음 수집이 2배 강화.
4. 런 종료 후 코인/보석 정산.
5. 도크에서 동일 티어 코어 병합 후 다음 런 진행.

## Mechanics (2+)
- **A. Real-time lane survival**: 4레인 좌우 이동 + 충돌 내구도.
- **B. Merge progression**: 동일 티어 2개를 상위 티어로 병합.
- **C. Charter economy**: 차터 선결제 및 수익 배율.
- **Unique. Wake Echo Draft**:
  - 이동 4회 교차 패턴 시 충전 1회.
  - 다음 코어 수집에 2배 수집 + 가치 증폭.
  - 같은 레인 3연속 수집 시 Drag Tax 배율 감소.

## Economy
- `runValue += tier * 12 * (wakeEcho ? 2 : 1)`
- `deckMultiplier = 1 + tierPoints(inventory)`
- `payout = runValue * deckMultiplier * charterMultiplier * wakeMultiplier * dragMultiplier * crashMultiplier`
- 차터:
  - local: free, x1.0
  - coast: 70 coins, x1.32
  - grand: 3 gems, x1.58

## Constraints
- 리듬 판정/BPM 기반 요소 없음
- 네온 다크 팔레트 금지
- 모바일 우선 입력(버튼+터치)
- 외부 API 의존 없음

## Persistence
- key: `sunlit_buoy_forge_save_v1`
- save: day, coins, gems, totalRevenue, bestPayout, inventory
