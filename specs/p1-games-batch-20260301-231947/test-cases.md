# P1 Games Batch Test Cases — 20260301-231947

## Global Functional
- TC-G-001: 각 게임 진입 시 HUD/게임 영역/컨트롤이 렌더링된다.
- TC-G-002: 게임 오버(또는 실패) 후 재시작이 가능하다.
- TC-G-003: 최고 기록이 localStorage에 저장되고 재접속 시 복원된다.

## Input Compatibility
- TC-I-001: 키보드 입력이 즉시 반영된다.
- TC-I-002: 터치/포인터 입력이 동일 기능으로 동작한다.
- TC-I-003: 390x844 뷰포트에서 컨트롤 겹침이 없다.

## Audio + Stability
- TC-A-001: Web Audio API 효과음이 입력/성공/실패 이벤트에서 재생된다.
- TC-A-002: 치명적 JS 에러 없이 메인 루프가 유지된다.

## PWA + Theme
- TC-P-001: 문서에 `manifest.webmanifest` 링크가 존재한다.
- TC-P-002: manifest의 `background_color`/`theme_color`가 `#0a0a1a`다.
- TC-P-003: UI가 네온 다크 테마를 유지한다.

## File Constraints
- TC-F-001: 각 `index.html` 파일 크기가 500KB 미만이다.
- TC-F-002: 외부 JS/CSS/이미지 의존성이 없다.

## Per-Game Specific
### neon-nocturne-switchboard
- TC-NN-001: 들어오는 신호의 lane 매칭 성공/실패 판정이 점수와 stability에 반영된다.
- TC-NN-002: 콤보가 점수 배율로 반영된다.

### chrono-sandglass-smuggler
- TC-CS-001: 좌우 이동과 freeze(홀드)로 장애물 회피가 가능하다.
- TC-CS-002: energy 소모/회복이 freeze 사용과 연동된다.

### auric-pollen-panic
- TC-AP-001: 3개 구역 지표가 시간에 따라 감소/상승한다.
- TC-AP-002: 선택 구역 + 액션 입력이 지표 회복에 반영된다.

## Scoring Rubric (Gap Analysis)
- 항목 10개 × 10점 = 100점
  1) 키보드 입력
  2) 터치 입력
  3) Web Audio API
  4) localStorage
  5) 모바일 반응형
  6) PWA manifest
  7) #0a0a1a 네온 다크
  8) 외부 의존성 없음
  9) 파일 크기 준수
  10) 코어 메커닉 작동
- 합격 기준: 90점 이상 (미달 시 최대 3회 수정)
