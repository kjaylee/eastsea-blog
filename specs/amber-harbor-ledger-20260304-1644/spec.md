# Spec — amber-harbor-ledger

## Product intent
밝은 톤 모바일 우선 hybrid vertical slice. 레인 항해 액션 + 모드 전환 수집 + 병합 성장 + 계약 경제를 결합한다.

## Core loop
1. 도크에서 Route(Local/Fleet/Guild) 선택.
2. 런 시작 후 3레인 이동 + Sail Mode(Breeze/Anchor) 전환.
3. 부유 잔해를 회피하고 모드 일치 화물을 수집.
4. 런 종료 시 계약/패턴 규칙 기반 수익 정산.
5. Ledger에서 동일 티어 화물 병합 후 다음 런 준비.

## Mechanics (2+)
- **A. Real-time lane survival**: 좌우 이동 + 충돌 판정 + 선체 내구도.
- **B. Sail mode switching**: Breeze/Anchor 모드에 맞는 화물만 안전 수집.
- **C. Merge progression**: 동일 티어 화물 2개 병합.
- **D. Route economy**: 계약 비용/배율 차등.
- **Unique. Wake Weave Dividend**:
  - 연속 수집 lane history에서 3회가 모두 다른 레인이면 `x1.27` 보너스.
  - 동일 레인 3연속 수집이면 Congestion Toll `x0.74` 패널티.

## Economy
- `runValue += tier * 12`
- `holdMultiplier = 1 + tierPoints(inventory)`
- `payout = runValue * holdMultiplier * routeMultiplier * patternMultiplier * crashMultiplier`
- route:
  - local: free, x1.00
  - fleet: 70 coins, x1.33
  - guild: 2 gems, x1.58

## Constraints
- 리듬 요소 없음(BPM/박자 판정 없음)
- neon dark 금지(라이트 배경/웜 톤)
- 모바일 우선 입력(버튼 + 터치)
- 외부 API 의존 없음

## Persistence
- key: `amber_harbor_ledger_save_v1`
- save: day, coins, gems, totalRevenue, bestPayout, inventory
