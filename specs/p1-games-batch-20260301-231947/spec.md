# P1 Games Batch Spec — 20260301-231947

## Objective
신규 HTML5 게임 3종을 `games/{slug}/index.html` + `manifest.webmanifest` 구조로 추가하고, `games/manifest.json` 선두 prepend로 반영한다.

## New Games (Unique Slugs)
1. `neon-nocturne-switchboard` — **Rhythm / Routing Arcade**
   - 코어 루프: 들어오는 4채널 신호를 타이밍 맞춰 올바른 라인으로 라우팅
   - 목표: overload 없이 combo를 쌓아 최고 점수 달성
2. `chrono-sandglass-smuggler` — **Action / Stealth Runner**
   - 코어 루프: 좌우 이동 + time-freeze로 감시 드론/장벽 회피하며 카고 회수
   - 목표: 생존 시간과 연속 회수 콤보로 최고 점수 갱신
3. `auric-pollen-panic` — **Simulation / Ecosystem Triage**
   - 코어 루프: 3개 생태 구역의 수분·꽃가루·병해 지표를 액션으로 안정화
   - 목표: 붕괴 없이 최대 wave 유지

## Mandatory Checklist Targets
- 터치 + 키보드 동시 지원
- Web Audio API 효과음 포함
- localStorage 최고 기록 저장
- 모바일 반응형(390x844 포함)
- `manifest.webmanifest` 제공(PWA)
- 시각 테마 `#0a0a1a` 기반 네온 다크
- 각 `index.html` 파일 500KB 미만
- 외부 의존성 없음(단일 파일)

## Technical Constraints
- Vanilla HTML/CSS/JS only
- 각 게임 디렉토리에 `index.html`, `manifest.webmanifest`만 생성
- 접근성 최소 기준: 버튼 `aria-label`, 캔버스 `aria-label`

## Manifest Integration
- `games/manifest.json`
  - 신규 3개 게임 객체를 `games` 배열 맨 앞에 prepend
  - `count: 185`로 갱신
  - `updatedAt`: 현재 시각 ISO 문자열로 갱신

## Acceptance Criteria
- 3개 게임 정상 실행
- 체크리스트 기준 각 게임 90점 이상
- manifest 반영 + git commit/push 완료
