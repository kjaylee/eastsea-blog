# P1z Games Batch Spec — 20260301-203940

## 목표
신규 HTML5 게임 3종을 `games/{slug}/index.html` + `games/{slug}/manifest.webmanifest`로 제작하고,
`games/manifest.json`에 3개 항목을 **배열 맨 앞 prepend** 후 `count: 161`로 갱신한다.

## 신규 게임 라인업 (장르 다양화)
1. **quantum-quilt-cascade** (puzzle)
   - 콘셉트: 6x6 퀼트 보드의 패턴 셀을 토글/파장 전파로 목표 문양에 맞추는 라운드형 논리 퍼즐.
   - 코어 루프: 입력(셀 선택) → 인접 파장 반전 → 목표 일치율/이동 수 평가.

2. **semaphore-sandbar-salvage** (action)
   - 콘셉트: 모래톱 사이를 통과하는 구조정을 좌우 조종하며 신호 부표를 수집하고 난파 잔해를 회피하는 고속 반응 액션.
   - 코어 루프: 입력(좌우 이동/대시) → 충돌 회피 + 수집 → 속도 단계 상승.

3. **hologram-habitat-triage** (simulation)
   - 콘셉트: 4개 홀로그램 거주 모듈의 Oxygen/Heat/Stress를 실시간으로 안정화하는 위기 대응 운영 시뮬레이션.
   - 코어 루프: 입력(모듈 선택+조치) → 수치 변동 피드백 → 생존 시간/점수 누적.

## 공통 기술/품질 제약
- 단일 파일: 각 게임 로직/CSS/HTML를 `index.html` 1개에 내장 (외부 의존성 없음)
- 입력: 키보드 + 터치 동시 지원
- 사운드: Web Audio API로 SFX 재생
- 저장: localStorage 최고기록/최고라운드/최고점수 저장
- UI: 모바일 반응형 + 네온 다크 테마 (`#0a0a1a` 기반)
- 용량: 각 `index.html` 500KB 미만
- PWA: 각 폴더 `manifest.webmanifest` 작성

## 산출물
- `games/quantum-quilt-cascade/index.html`
- `games/quantum-quilt-cascade/manifest.webmanifest`
- `games/semaphore-sandbar-salvage/index.html`
- `games/semaphore-sandbar-salvage/manifest.webmanifest`
- `games/hologram-habitat-triage/index.html`
- `games/hologram-habitat-triage/manifest.webmanifest`
- `games/manifest.json` (prepend + count + updatedAt)

## 완료 정의
- 3개 게임 실행 가능, 필수 체크리스트(터치+키보드/Web Audio/localStorage/반응형/PWA/#0a0a1a/<500KB) 충족
- 갭 분석 점수 90% 이상
- 커밋/푸시: `feat: +3 games (quantum-quilt-cascade, semaphore-sandbar-salvage, hologram-habitat-triage) — total 161`
