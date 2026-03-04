# Implementation — terrace-seed-graft

## Added files
- `games/terrace-seed-graft/index.html`
- `games/terrace-seed-graft/app.mjs`
- `games/terrace-seed-graft/logic.mjs`
- `tests/unit/terrace-seed-graft.test.mjs`

## Core implementation notes
- 상태 머신: `dock` ↔ `run`, 런타임 필드 초기화/정산 분리.
- 조합 메카닉:
  - 3레인 실시간 이동 + hazard 회피
  - Clip/Bind stance 전환 및 phase 일치 pod 수집
  - dock 병합(최상위 pair 우선)
  - route 비용/배율 경제
- 고유 메카닉:
  - graft plan(`reedplum`, `plumtea`, `teareed`) 선택
  - species 로그 연속 pair 정순(+12%) / 역순(+5%) 누적, 총 상한 +45%
  - 동일 species 3연속 시 wilt penalty ×0.76
- UI:
  - 밝은 warm palette, 모바일 우선 버튼/터치 입력
  - HUD에 graft state(Exact/Reverse/Wilt) 실시간 반영
- 저장:
  - `localStorage` key: `terrace_seed_graft_save_v1`
  - day/coins/gems/revenue/best/inventory/plan 저장
