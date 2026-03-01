# P1 Games Batch Spec — 20260301-230256

## Objective
신규 HTML5 게임 3종을 `games/{slug}/index.html` + `manifest.webmanifest` 구조로 추가하고, `games/manifest.json`에 선두 prepend로 반영한다.

## New Games (Unique Slugs)
1. `driftglass-parry` — **Action**
   - 코어 루프: 좌/우 이동 + 패링 타이밍(홀드)으로 파편 반사/회피
   - 목표: 90초 생존 중 최대 점수 달성
2. `nebula-noise-cartographer` — **Puzzle / Audio Memory**
   - 코어 루프: 재생된 노이즈-비트 패턴을 동일 순서로 입력
   - 목표: 라운드 길이 증가를 버티며 최고 라운드 갱신
3. `quasar-quota-keeper` — **Simulation / Resource Triage**
   - 코어 루프: 3개 지표(전력/냉각/신뢰) 운영 액션 배분
   - 목표: 붕괴 없이 최대 웨이브 생존

## Mandatory Checklist Targets
- 터치 + 키보드 동시 지원
- Web Audio API 효과음/신호음 포함
- localStorage 최고 기록 저장
- 모바일 반응형(390x844 기준 포함)
- `manifest.webmanifest` 제공(PWA)
- 시각 테마: `#0a0a1a` 기반 네온 다크
- 각 `index.html` 파일 500KB 미만
- 외부 의존성 없음(단일 파일)

## Technical Constraints
- Vanilla HTML/CSS/JS only
- 각 게임 디렉토리에 파일 2개만 생성(`index.html`, `manifest.webmanifest`)
- 접근성 최소 기준: 버튼 라벨, 캔버스 aria-label

## Manifest Integration
- `games/manifest.json`
  - 신규 3개 게임 객체를 `games` 배열 맨 앞에 prepend
  - `count: 182`로 증가
  - `updatedAt`: 현재 시각 ISO 문자열로 갱신

## Acceptance Criteria
- 3개 게임이 브라우저에서 실행 가능
- 각 게임이 체크리스트 90% 이상 충족
- git commit + push 완료
