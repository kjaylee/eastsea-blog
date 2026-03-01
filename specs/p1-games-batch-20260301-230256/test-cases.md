# P1 Games Batch Test Cases — 20260301-230256

## Global Functional
- TC-G-001: 각 게임 진입 시 초기 화면/점수판이 정상 렌더링된다.
- TC-G-002: 게임 오버/실패 후 재시작이 가능하다.
- TC-G-003: 최고 기록이 localStorage에 저장되고 재접속 시 복원된다.

## Input Compatibility
- TC-I-001: 키보드 조작이 즉시 반영된다.
- TC-I-002: 터치/포인터 조작이 동일 기능으로 동작한다.
- TC-I-003: 모바일에서 버튼 배치가 겹치지 않는다(390x844).

## Audio + Performance
- TC-A-001: Web Audio API로 성공/실패/입력 효과음이 재생된다.
- TC-A-002: 콘솔 치명 오류 없이 루프가 유지된다.

## PWA + Theme
- TC-P-001: `manifest.webmanifest` 링크가 존재한다.
- TC-P-002: manifest의 `background_color`, `theme_color`가 `#0a0a1a`이다.
- TC-P-003: UI가 네온 다크 톤을 유지한다.

## File Constraints
- TC-F-001: 각 `index.html` 파일 크기 < 500KB.
- TC-F-002: 외부 JS/CSS/이미지 의존성이 없다.

## Per-Game Specific
### driftglass-parry
- TC-DP-001: 좌우 이동과 parry(홀드) 판정이 점수/피해에 반영된다.

### nebula-noise-cartographer
- TC-NN-001: 패턴 재생 후 입력 순서 정오 판정이 작동한다.
- TC-NN-002: 라운드 증가 시 패턴 길이가 증가한다.

### quasar-quota-keeper
- TC-QQ-001: 3개 지표가 시간에 따라 감소하고 액션으로 복구된다.
- TC-QQ-002: 지표 0 도달 시 게임 오버 처리된다.

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
  10) 코어 메커닉 정상 작동
- 합격 기준: 90점 이상
