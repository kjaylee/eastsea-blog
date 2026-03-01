# P1 Games Batch Spec — 20260301-220318

## 목표
신규 HTML5 게임 3종을 `games/{slug}/index.html` + `games/{slug}/manifest.webmanifest`로 제작하고,
`games/manifest.json`에 3개 항목을 **배열 맨 앞 prepend** 후 `count: 176`으로 갱신한다.

## 신규 게임 라인업 (장르 다양화)
1. **magnet-metro-marshal** (action)
   - 콘셉트: 3레인 자기 부상 열차를 좌우 전환·펄스로 조종해 승객 캡슐을 수집하고 차단벽을 회피하는 하이퍼 반응 액션.
   - 코어 루프: 이동/스킬 입력 → 수집/회피 판정 → 속도 상승과 점수 누적.

2. **chrono-coral-loom** (puzzle)
   - 콘셉트: 5x5 산호 직조 보드에서 선택 셀의 행·열 위상을 반전해 목표 패턴을 복원하는 라운드형 퍼즐.
   - 코어 루프: 커서 이동/토글 → 패턴 변화 확인 → 제한 이동 내 정답 달성.

3. **tidal-ledger-tycoon** (simulation)
   - 콘셉트: 3개 항만 구역(물류·에너지·복지)의 지표를 실시간으로 조정해 적자를 막고 신뢰도를 유지하는 운영 시뮬레이션.
   - 코어 루프: 구역 선택+조치 → 지표 변동 피드백 → 생존 시간/수익 극대화.

## 공통 기술/품질 제약
- 단일 파일: 각 게임 로직/CSS/HTML를 `index.html` 1개에 내장 (외부 의존성 없음)
- 입력: 키보드 + 터치 동시 지원
- 사운드: Web Audio API로 SFX 재생
- 저장: localStorage 최고기록(점수/스테이지) 저장
- UI: 모바일 반응형 + 네온 다크 테마 (`#0a0a1a` 기반)
- 용량: 각 `index.html` 500KB 미만
- PWA: 각 폴더 `manifest.webmanifest` 작성

## 산출물
- `games/magnet-metro-marshal/index.html`
- `games/magnet-metro-marshal/manifest.webmanifest`
- `games/chrono-coral-loom/index.html`
- `games/chrono-coral-loom/manifest.webmanifest`
- `games/tidal-ledger-tycoon/index.html`
- `games/tidal-ledger-tycoon/manifest.webmanifest`
- `games/manifest.json` (prepend + count + updatedAt)

## 완료 정의
- 3개 게임 실행 가능, 필수 체크리스트(터치+키보드/Web Audio/localStorage/반응형/PWA/#0a0a1a/<500KB) 충족
- 갭 분석 점수 90% 이상
- 커밋/푸시: `feat: +3 games (magnet-metro-marshal, chrono-coral-loom, tidal-ledger-tycoon) — total 176`
