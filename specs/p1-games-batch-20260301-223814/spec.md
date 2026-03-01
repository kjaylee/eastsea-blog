# P1 Games Batch Spec — 20260301-223814

## 목표
신규 HTML5 게임 3종을 `games/{slug}/index.html` + `games/{slug}/manifest.webmanifest`로 제작하고,
`games/manifest.json`에 신규 3개를 **배열 맨 앞 prepend** 후 `count`를 179로 갱신한다.

## 신규 게임 라인업 (장르 다양화)
1. **emberline-skyhook-run** (action)
   - 콘셉트: 공중 레일 위 Skyhook를 좌/우 레인 전환 + Boost로 조작해 에너지 링을 수집하고 충돌 드론을 회피하는 반응형 러너.
   - 코어 루프: 입력 → 회피/수집 판정 → 속도 상승 → 점수 극대화.

2. **glyph-vat-calibrator** (puzzle)
   - 콘셉트: 5x5 글리프 배양판에서 선택 셀 + 직교 인접 셀을 토글해 목표 패턴을 맞추는 라운드형 논리 퍼즐.
   - 코어 루프: 커서/터치 선택 → 패턴 변화 확인 → 제한 이동 내 정답 달성.

3. **harbor-harmonics-dispatch** (simulation)
   - 콘셉트: 3개 항만 채널(화물/전력/신뢰) 상태를 Dispatch 액션으로 안정화해 90초 교대 근무를 버티는 운영 시뮬레이션.
   - 코어 루프: 채널 선택 + 액션 집행 → 지표 변동 대응 → 붕괴 방지 + 점수 누적.

## 공통 필수 체크리스트
- 터치 + 키보드 입력 동시 지원
- Web Audio API 효과음 구현 (`AudioContext`)
- localStorage 최고기록 저장/복원
- 모바일 반응형(최소 390x844 기준 플레이 가능)
- PWA manifest (`manifest.webmanifest`) 제공
- 네온 다크 테마 기반 컬러 `#0a0a1a`
- 각 `index.html` 파일 크기 500KB 미만
- 외부 라이브러리/리소스 없는 단일 HTML

## 산출물
- `games/emberline-skyhook-run/index.html`
- `games/emberline-skyhook-run/manifest.webmanifest`
- `games/glyph-vat-calibrator/index.html`
- `games/glyph-vat-calibrator/manifest.webmanifest`
- `games/harbor-harmonics-dispatch/index.html`
- `games/harbor-harmonics-dispatch/manifest.webmanifest`
- `games/manifest.json` (prepend + count 179 + updatedAt)

## 완료 정의
- 3개 게임 실행/재시작 가능
- 체크리스트 100% 충족 (최소 90점 이상)
- manifest 반영 완료 (신규 3개 맨 앞, count 179)
- 커밋/푸시 완료: `feat: +3 games (emberline-skyhook-run, glyph-vat-calibrator, harbor-harmonics-dispatch) — total 179`
