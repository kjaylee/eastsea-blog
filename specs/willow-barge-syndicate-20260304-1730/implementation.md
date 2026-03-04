# Implementation — willow-barge-syndicate

## Added
- 신규 게임 디렉토리 `games/willow-barge-syndicate/`
  - `logic.mjs`: 상태 머신, lane/mode 입력, 스폰/충돌, 정산, 병합, 계약, 고유 패턴 로직
  - `app.mjs`: HUD 렌더링, 캔버스 시각화, 키보드/터치 입력, 저장 연동
  - `index.html`: 모바일 우선 라이트 UI
- 단위테스트 `tests/unit/willow-barge-syndicate.test.mjs` (9 cases)
- 스펙 문서 세트(`research/spec/plan/test-cases/verification/launch-report/gap-analysis`)

## Unique mechanic implementation details
- `runPatternLog`에 성공 수집 시 `{lane, mode}` 기록
- `hasRelayTriple`:
  - 3연속 수집에서 lane 3개가 모두 다르고
  - mode 패턴이 교대(`a!=b`, `b!=c`, `a==c`)이면 Canal Relay Bonus `x1.34`
- `hasSiltTriple`:
  - 3연속 수집이 동일 lane 3연속 또는 동일 mode 3연속이면 Silt Lock Penalty `x0.72`
- 정산식 `patternMultiplier`에 반영, HUD/결과 문구 동기화
