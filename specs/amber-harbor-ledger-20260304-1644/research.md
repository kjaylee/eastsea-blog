# Research — amber-harbor-ledger

## Goal
혼합 메카닉(2개+) 기반 신규 게임 vertical slice 1개를 제작/검증/커밋한다.
제약: 리듬게임 금지, neon dark 금지, 고유 메카닉 필수.

## Existing code references reviewed
1. `games/sunpetal-magnet-foundry/logic.mjs`
   - dock/run 상태 머신, 충돌 주입(`withInjectedTokens`), 정산/병합/계약 루프 구조 확인.
2. `games/sunpetal-magnet-foundry/app.mjs`
   - 캔버스 렌더 + 모바일 포인터 입력 + localStorage 저장 흐름 재사용 가능 패턴 확인.
3. `tests/unit/sunpetal-magnet-foundry.test.mjs`
   - node:test 포맷과 고유 메카닉 배율 검증 케이스 구성 패턴 확인.
4. `scripts/build-manifests.sh`
   - 신규 게임 폴더 인식 후 `games/manifest.json` 자동 갱신 절차 확인.

## Reusable production pattern
- `logic.mjs`: 순수 함수 중심(초기화/입력/스폰/충돌/정산/계약/병합)
- `app.mjs`: DOM 바인딩 + RAF 루프 + 키보드/터치 입력
- `index.html`: 라이트 테마 모바일 우선 2컬럼 레이아웃
- `tests/unit/*.test.mjs`: 핵심 규칙 8개 이상 검증

## Design decision for this slice
- 게임명: **Amber Harbor Ledger**
- 메카닉 조합:
  1) 3레인 실시간 회피/수집
  2) Sail Mode 전환(Breeze/Anchor) 기반 화물 판정
  3) 도크 병합(동일 티어 2개 → 상위 티어)
  4) Route 계약 경제(Local/Fleet/Guild)
- 고유 메카닉: **Wake Weave Dividend / Congestion Toll**
  - 성공 수집 lane history에서 연속 3회가 모두 다른 레인이면 Wake Weave 배당 `x1.27`
  - 동일 레인 3연속 수집이면 Congestion Toll 패널티 `x0.74`
- 아트/톤: 아이보리/샌드/앰버 중심 라이트 팔레트(네온 다크 배제)

## Verification plan
- `node --check games/amber-harbor-ledger/logic.mjs`
- `node --check games/amber-harbor-ledger/app.mjs`
- `node --test tests/unit/amber-harbor-ledger.test.mjs`
- `bash scripts/build-manifests.sh`
- `node -e "...manifest entry check..."`
- `python3 -m http.server + curl`로 title 스모크 확인
