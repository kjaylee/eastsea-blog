# Spec — terrace-seed-graft

## Product intent
밝은 톤 모바일 우선 hybrid vertical slice. 레인 회피 + stance 전환 수집 + graft pair-chain 보너스 + 병합 경제를 결합한다.

## Core loop
1. Dock에서 Route와 Graft Plan 선택.
2. Run 시작 후 3레인 이동과 Clip/Bind stance 전환으로 seed pod 수집.
3. hazard를 회피하고 stance 일치 pod를 확보.
4. Run 종료 시 hold/route/graft/wilt 규칙으로 payout 정산.
5. Dock에서 동일 tier 2개 병합 후 다음 run 준비.

## Mechanics (2+)
- **A. Real-time lane survival**: 좌우 이동, hazard 충돌 시 hull 감소.
- **B. Tool stance switching**: Clip/Bind stance가 pod phase와 일치해야 수집 성공.
- **C. Merge progression**: 동일 tier 2개를 상위 tier로 병합.
- **D. Route economy**: route 비용/배율 차등.
- **Unique. Graft Pair Chain**
  - Dock에서 graft pair 선택 (예: Reed→Plum).
  - run 수집 species 로그의 연속 pair가 정순 일치할 때마다 +12% (누적 상한 +45%).
  - 역순 일치 pair는 +5%.
  - 동일 species 3연속은 wilt penalty ×0.76.

## Economy
- `runValue += tier * 13`
- `holdMultiplier = 1 + tierPoints(inventory)`
- `payout = runValue * holdMultiplier * routeMultiplier * pairMultiplier * wiltMultiplier * crashMultiplier`
- routes:
  - local: free, x1.00
  - canal: 100 coins, x1.30
  - summit: 2 gems, x1.56

## Constraints
- 리듬 요소 없음(BPM/박자 판정 없음)
- neon dark 금지(밝은 ivory/sand/olive palette)
- 모바일 우선 입력(버튼 + 터치)
- 외부 API 의존 없음

## Persistence
- key: `terrace_seed_graft_save_v1`
- save: day, coins, gems, totalRevenue, bestPayout, inventory, plan
