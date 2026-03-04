# Research — sunpetal-magnet-foundry

## Goal
새 혼합 메카닉 게임 vertical slice 1개를 제작한다. 제약: 리듬게임 금지, neon dark 금지, 고유 메카닉 필수.

## Existing code references reviewed
1. `games/meadow-parcel-weavers/logic.mjs`
   - 상태 머신(`dock`/`run`), 경제 정산, 병합 루프, 고유 패턴 보너스 구조를 확인.
2. `games/meadow-parcel-weavers/app.mjs`
   - 캔버스 렌더 + 모바일 입력 + 로컬 저장 연동 패턴을 확인.
3. `tests/unit/sunlit-buoy-forge.test.mjs`
   - 로직 단위테스트 포맷(node:test), 충돌 주입(`withInjectedTokens`) 검증 방식을 확인.

## Reusable production pattern
- `logic.mjs`: 순수 함수 중심 (초기화/시작/이동/충돌/정산/병합/계약 선택)
- `app.mjs`: DOM 바인딩 + requestAnimationFrame + 입력 이벤트
- `index.html`: 밝은 팔레트 기반 2컬럼 모바일 우선 UI
- `tests/unit/*.test.mjs`: 8개 이상 핵심 테스트 케이스
- `scripts/build-manifests.sh` 후 `games/manifest.json` 엔트리 확인

## Design decision for this slice
- 게임명: **Sunpetal Magnet Foundry**
- 메카닉 조합:
  1) 실시간 3레인 회피/수집
  2) 자석 극성 전환(N/S) 기반 수집 판정
  3) Foundry 코어 병합(T1~T5)
  4) Route 계약 경제(Local/Bazaar/Royal)
- 고유 메카닉: **Prism Flip Dividend**
  - 연속 4회 수집에서 극성이 교차(N-S-N-S 또는 S-N-S-N)하면 배당 보너스
  - 동일 극성 3연속 수집이면 Static Drag 패널티
- 아트/톤: 라이트 크림 + 웜 오렌지 계열, neon dark 배제

## Verification plan
- `node --check games/sunpetal-magnet-foundry/logic.mjs`
- `node --check games/sunpetal-magnet-foundry/app.mjs`
- `node --test tests/unit/sunpetal-magnet-foundry.test.mjs`
- `bash scripts/build-manifests.sh`
- `node -e "...manifest entry check..."`
- `python3 -m http.server + curl`로 `<title>` 스모크 확인
