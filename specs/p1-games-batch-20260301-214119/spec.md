# P1 Games Batch Spec — 20260301-214119

## 목표
신규 HTML5 게임 3종을 `games/{slug}/index.html` + `games/{slug}/manifest.webmanifest`로 제작하고,
`games/manifest.json`에 신규 3개 항목을 **배열 맨 앞 prepend** 후 `count`를 **170**으로 갱신한다.

## 신규 게임 라인업 (장르 다양화)
1. **sunken-signal-kite** (action)
   - 콘셉트: 심해 신호 연을 좌우 조종해 에너지 비컨을 회수하고 폭뢰를 회피하는 반응형 아케이드.
   - 코어 루프: 좌우 이동 입력 → 수집/회피 판정 → 점수 상승 + 속도 상승.

2. **teahouse-rush-director** (simulation)
   - 콘셉트: 3개 티하우스 스테이션(Boil/Brew/Serve)의 상태를 즉시 조치로 안정화하는 실시간 운영 시뮬레이션.
   - 코어 루프: 스테이션 선택 조치 → 상태 지표 회복/하락 → 생존 시간과 운영 점수 누적.

3. **parity-lens-workshop** (puzzle)
   - 콘셉트: 5x5 렌즈 보드에서 셀을 눌러 행/열 파리티를 반전해 목표 패턴을 맞추는 논리 퍼즐.
   - 코어 루프: 셀 선택/토글 → 패턴 변화 확인 → 제한 이동 내 목표 일치.

## 공통 기술/품질 제약
- 단일 파일: 각 게임 로직/CSS/HTML를 `index.html` 하나에 내장 (외부 의존성 없음)
- 입력: 키보드 + 터치 동시 지원
- 사운드: Web Audio API(`AudioContext`) 효과음
- 저장: localStorage로 최고 기록 저장/복원
- UI: 모바일 반응형 + 네온 다크 테마(`#0a0a1a`)
- 용량: 각 `index.html` 500KB 미만
- PWA: 각 폴더에 `manifest.webmanifest` 작성

## 산출물
- `games/sunken-signal-kite/index.html`
- `games/sunken-signal-kite/manifest.webmanifest`
- `games/teahouse-rush-director/index.html`
- `games/teahouse-rush-director/manifest.webmanifest`
- `games/parity-lens-workshop/index.html`
- `games/parity-lens-workshop/manifest.webmanifest`
- `games/manifest.json` (prepend + count + updatedAt)

## 완료 정의
- 3개 게임 모두 실행 가능
- 필수 체크리스트(터치+키보드/Web Audio/localStorage/반응형/PWA/#0a0a1a/<500KB) 충족
- 갭 분석 점수 90% 이상
- 커밋/푸시: `feat: +3 games (sunken-signal-kite, teahouse-rush-director, parity-lens-workshop) — total 170`
