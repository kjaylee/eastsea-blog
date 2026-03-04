# Spec — citrus-shade-caravan

## Product intent
밝은 톤 모바일 우선 하이브리드 vertical slice. 3레인 카라반 회피, 수확 상자 병합 성장, 계약 경제를 결합한다.

## Core loop
1. 도크에서 계약을 선택하고 런 시작.
2. 3레인에서 카트를 피하며 sun/shade 수확 상자(T1~T4)를 확보.
3. `Shade Swap Ledger` 조건을 충족해 다음 수확 2배 적재를 발동.
4. 런 종료 후 코인/보석 정산.
5. 도크에서 동일 티어 상자를 병합해 덱 배율을 올리고 다음 런.

## Mechanics (2+)
- **A. Real-time lane dodge**: 3레인 좌우 이동 + 충돌 내구도(3).
- **B. Merge progression**: 동일 티어 2개를 상위 티어로 병합.
- **C. Contract economy**: 계약 선결제 후 정산 배율 적용.
- **Unique. Shade Swap Ledger**:
  - 수확 톤(sun/shade) 4연속 교차(ABAB)로 charge 1 획득.
  - charge 상태의 다음 수확은 적재량/가치 2배.
  - 같은 레인 3연속 수확 시 crowd penalty 배율 적용.

## Economy
- `runValue += tier * 13 * (shadeSwapCharge ? 2 : 1)`
- `deckMultiplier = 1 + tierPoints(inventory)`
- `payout = runValue * deckMultiplier * contractMultiplier * shadeChainMultiplier * crowdMultiplier * crashMultiplier`
- 계약:
  - stall: free, x1.0
  - market: 80 coins, x1.34
  - festival: 4 gems, x1.62

## Constraints
- 리듬 판정/BPM 기반 요소 없음
- neon dark 팔레트 금지(밝은 크림/시트러스)
- 모바일 우선 입력(버튼 + 터치)
- 외부 API 의존 없음

## Persistence
- key: `citrus_shade_caravan_save_v1`
- save: day, coins, gems, totalRevenue, bestPayout, inventory
