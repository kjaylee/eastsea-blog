# Spec — sunlit-kite-mercantile

## Product intent
밝은 톤의 모바일 우선 하이브리드 게임 슬라이스를 제작한다. 실시간 회피 조작 + 병합 성장 + 계약 경제 의사결정을 결합한다.

## Core loop
1. 런 시작 후 3레인에서 카이트 카트를 좌우 이동.
2. 과일 바구니 토큰을 수집하고 까마귀 토큰을 회피.
3. 런 종료 시 수집량을 정산해 코인/젬 획득.
4. 도크에서 바구니 병합으로 상위 티어 확보.
5. 다음 런 계약(마켓/호텔/페스티벌)을 선택해 배율/비용을 조정.

## Mechanics (2+)
- **A. Real-time lane survival**: 레인 이동과 충돌 판정.
- **B. Merge progression**: 같은 티어 2개 병합.
- **C. Contract economy**: 계약 선택 시 비용(코인/젬)과 수익 배율 변화.
- **Unique. Tailwind Tax**: 런 중 레인 변경 횟수가 8회 이상이면 수익 18% 감세.

## Economy
- `runValue += tier * 12`
- `deckMultiplier = 1 + tierPoints(inventory)`
- `payout = runValue * deckMultiplier * contractMultiplier * spoilageMultiplier * tailwindMultiplier * crashMultiplier`
- 계약:
  - market: free, x1.0
  - hotel: 55 coins, x1.28 (피격 시 spoilage 0.72)
  - festival: 3 gems, x1.52

## Constraints
- 리듬 요소 없음 (BPM/비트 타이밍 없음)
- neon dark 톤 금지 (밝은 배경 + 저채도 포인트)
- 모바일 우선 UI
- 외부 API 의존 없음

## Persistence
- key: `sunlit_kite_mercantile_save_v1`
- save: day, coins, gems, totalRevenue, bestPayout, inventory
