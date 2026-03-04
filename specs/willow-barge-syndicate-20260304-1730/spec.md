# Spec — willow-barge-syndicate

## Product intent
밝은 톤 모바일 우선 hybrid vertical slice. 운하 3레인 회피 + Tide mode 전환 수집 + 병합 성장 + 계약 경제를 결합한다.

## Core loop
1. Dock에서 Route(Local/Trader/Consortium) 선택.
2. Run 시작 후 3레인 이동 + Tide mode(Sun/Shadow) 전환.
3. debris를 회피하며 mode 일치 barge crate를 수집.
4. run 종료 시 계약/패턴 규칙 기반 수익 정산.
5. Dock에서 동일 tier crate 2개 병합 후 다음 run 준비.

## Mechanics (2+)
- **A. Real-time lane survival**: 좌우 이동, 충돌 판정, hull 감소.
- **B. Tide mode switching**: Sun/Shadow 모드와 crate mark 일치 시 수집 성공.
- **C. Merge progression**: 동일 tier 2개를 상위 tier로 병합.
- **D. Route economy**: 계약 비용/배율 차등.
- **Unique. Canal Relay Bonus / Silt Lock Penalty**
  - 최근 3회 성공 수집에서 lane 3개가 모두 다르고 mode가 교대 패턴이면 `x1.34`.
  - 최근 3회 성공 수집이 lane 동일 3연속 또는 mode 동일 3연속이면 `x0.72`.

## Economy
- `runValue += tier * 13`
- `holdMultiplier = 1 + tierPoints(inventory)`
- `payout = runValue * holdMultiplier * routeMultiplier * patternMultiplier * crashMultiplier`
- routes:
  - local: free, x1.00
  - trader: 80 coins, x1.36
  - consortium: 2 gems, x1.62

## Constraints
- 리듬 요소 없음(BPM/박자 판정 없음)
- neon dark 금지(밝은 배경/웜-내추럴 팔레트)
- 모바일 우선 입력(버튼 + 터치)
- 외부 API 의존 없음

## Persistence
- key: `willow_barge_syndicate_save_v1`
- save: day, coins, gems, totalRevenue, bestPayout, inventory
