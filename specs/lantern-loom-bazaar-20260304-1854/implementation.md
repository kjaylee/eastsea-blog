# Implementation — lantern-loom-bazaar

## Added files
- `games/lantern-loom-bazaar/index.html`
- `games/lantern-loom-bazaar/app.mjs`
- `games/lantern-loom-bazaar/logic.mjs`
- `tests/unit/lantern-loom-bazaar.test.mjs`

## Core implementation notes
- 상태 머신: `dock` ↔ `run` 구조, 런타임 필드 초기화/정산 분리.
- 조합 메카닉:
  - 3레인 실시간 이동 + hazard 회피
  - Dawn/Dusk phase 전환 및 phase 일치 crate 수집
  - dock 병합(최상위 pair 우선)
  - route 비용/배율 경제
- 고유 메카닉:
  - 계약 시퀀스(`sunleafwave`, `leafwavesun`, `wavesunleaf`) 선택
  - 수집 문양 로그에서 정순/역순 매칭 배율
  - 동일 문양 3연속 `tangle` 패널티
- UI:
  - 밝은 warm palette, 모바일 우선 버튼 구성, canvas 터치 좌/중/우 입력.
  - HUD에 계약 상태 및 정산 결과 표시.
- 저장:
  - `localStorage` key: `lantern_loom_bazaar_save_v1`
  - day/coins/gems/revenue/best/inventory/contract 저장.
