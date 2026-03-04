# Spec — lantern-loom-bazaar

## Product intent
밝은 톤 모바일 우선 hybrid vertical slice. 레인 회피 + phase 전환 수집 + 문양 계약 시퀀스 + 병합 경제를 결합한다.

## Core loop
1. Dock에서 Route 선택 + Loom Contract(문양 시퀀스) 선택.
2. Run 시작 후 3레인 이동과 Dawn/Dusk phase 전환으로 crate를 수집한다.
3. hazard를 회피하고 phase 일치 crate를 확보한다.
4. Run 종료 시 hold/route/contract/tangle 규칙으로 payout 정산.
5. Dock에서 동일 tier 2개 병합 후 다음 run 준비.

## Mechanics (2+)
- **A. Real-time lane survival**: 좌우 이동, hazard 충돌 시 hull 감소.
- **B. Lantern phase switching**: Dawn/Dusk phase가 crate phase와 일치해야 수집 성공.
- **C. Merge progression**: 동일 tier 2개를 상위 tier로 병합.
- **D. Route economy**: route 비용/배율 차등.
- **Unique. Loom Contract Sequence**
  - Dock에서 계약 시퀀스 선택 (예: Sun→Leaf→Wave).
  - run 성공 수집 문양 로그의 최근 3개가 계약과 정순 일치: `x1.42`.
  - 역순 일치: `x1.18`.
  - 동일 문양 3연속: `x0.74` 패널티.

## Economy
- `runValue += tier * 14`
- `holdMultiplier = 1 + tierPoints(inventory)`
- `payout = runValue * holdMultiplier * routeMultiplier * sequenceMultiplier * tangleMultiplier * crashMultiplier`
- routes:
  - local: free, x1.00
  - guild: 90 coins, x1.33
  - moon: 2 gems, x1.59

## Constraints
- 리듬 요소 없음(BPM/박자 판정 없음)
- neon dark 금지(밝은 ivory/sand/olive palette)
- 모바일 우선 입력(버튼 + 터치)
- 외부 API 의존 없음

## Persistence
- key: `lantern_loom_bazaar_save_v1`
- save: day, coins, gems, totalRevenue, bestPayout, inventory
