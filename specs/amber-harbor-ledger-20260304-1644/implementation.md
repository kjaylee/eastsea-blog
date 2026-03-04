# Implementation — amber-harbor-ledger

## Added
- 신규 게임 디렉토리 `games/amber-harbor-ledger/`
  - `logic.mjs`: 상태 머신, 입력 처리, 스폰/충돌, 정산, 병합, 계약, 고유 메카닉 계산
  - `app.mjs`: HUD 렌더링, 캔버스 시각화, 키보드/터치 입력, 저장 연동
  - `index.html`: 모바일 우선 라이트 UI
- 단위테스트 `tests/unit/amber-harbor-ledger.test.mjs` (9 cases)
- 스펙 문서 세트(`research/spec/plan/test-cases/verification/launch-report/gap-analysis`)

## Unique mechanic implementation details
- `runLaneHistory`에 성공 수집 lane 기록
- `hasDistinctTriple` → 3연속 상이 lane 검출 시 Wake Weave 배당 `x1.27`
- `hasTripleLaneStreak` → 동일 lane 3연속 시 Congestion Toll `x0.74`
- 정산식에 `patternMultiplier`로 적용, HUD/결과 문구에 반영
