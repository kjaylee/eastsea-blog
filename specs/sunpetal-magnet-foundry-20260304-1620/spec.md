# Spec — sunpetal-magnet-foundry

## Product intent
밝은 톤 모바일 우선 hybrid vertical slice. 레인 생존 액션 + 극성 전환 수집 + 병합 성장 + 계약 경제를 결합한다.

## Core loop
1. 도크에서 Route(Local/Bazaar/Royal) 선택.
2. 런 시작 후 3레인 이동 + 자석 극성(N/S) 전환.
3. hazard를 피하고 극성 일치 코어를 수집.
4. 런 종료 시 계약/패턴 규칙 기반 수익 정산.
5. Foundry에서 동일 티어 코어 병합 후 다음 런.

## Mechanics (2+)
- **A. Real-time lane survival**: 좌우 이동 + 충돌 판정 + 선체 체력.
- **B. Magnetic polarity switching**: 현재 극성과 일치한 코어만 안전 수집.
- **C. Merge progression**: 동일 티어 2개 병합.
- **D. Route economy**: 계약 비용/배율 차등.
- **Unique. Prism Flip Dividend**:
  - 수집 극성 히스토리 4연속 교차(N-S-N-S or S-N-S-N) 시 `x1.29`.
  - 동일 극성 3연속 수집 시 Static Drag `x0.78`.

## Economy
- `runValue += tier * 13`
- `vaultMultiplier = 1 + tierPoints(inventory)`
- `payout = runValue * vaultMultiplier * routeMultiplier * patternMultiplier * crashMultiplier`
- route:
  - local: free, x1.00
  - bazaar: 80 coins, x1.34
  - royal: 3 gems, x1.62

## Constraints
- 리듬 요소 없음(BPM/박자 판정 없음)
- neon dark 금지(라이트 배경/웜 톤)
- 모바일 우선 입력(버튼 + 터치)
- 외부 API 의존 없음

## Persistence
- key: `sunpetal_magnet_foundry_save_v1`
- save: day, coins, gems, totalRevenue, bestPayout, inventory
