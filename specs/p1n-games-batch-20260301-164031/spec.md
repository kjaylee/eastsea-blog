# P1n Games Batch Spec — 20260301-164031

## Batch Goal
신규 HTML5 미니게임 3종을 `games/{slug}/index.html` + `games/{slug}/manifest.webmanifest`로 생산하고,
`games/manifest.json`에 prepend 등록하여 count를 119로 갱신한다.

## New Slugs (중복 금지 확인 완료)
1. `constellation-courier-zipline` (arcade/action)
2. `reef-ledger-keeper` (simulation/strategy)
3. `origami-rescue-grid` (puzzle)

## Global Product Constraints
- 단일 HTML 파일(외부 라이브러리/외부 에셋 의존성 없음)
- 모바일 우선 반응형 UI (390x844 포함)
- 네온 다크 테마 `#0a0a1a` 기반
- 터치 + 키보드 입력 모두 지원
- Web Audio API 효과음 포함
- localStorage 기반 최고 기록/진행 저장
- 각 HTML 파일 500KB 미만
- PWA manifest 파일 포함 (`manifest.webmanifest`)

## Game Spec 1 — Constellation Courier Zipline
### Core Loop
- Input: 좌/우 레인 선택(←/→ 또는 A/D, 터치 버튼), Deliver(Enter/Space)
- Action: 현재 목표 별자리 색과 일치하는 패킷을 수집 후 전달
- Reward: 정확 전달 시 점수/콤보 증가, 실수 시 Shield 감소

### Systems
- Progression: 라운드 경과에 따라 낙하 속도/목표 전환 빈도 상승
- Economy: combo multiplier + accuracy bonus
- Save/Load: best score 저장

## Game Spec 2 — Reef Ledger Keeper
### Core Loop
- Input: 4개 정책 버튼 선택(정화/산호심기/순찰/연구), 턴 종료
- Action: 산소/생물다양성/관광/예산 지표를 목표 범위 유지
- Reward: 연속 안정 턴 보너스, 장기 생존 점수 상승

### Systems
- Progression: 분기(turn) 상승 시 외부 이벤트 강도 증가
- Economy: 예산 소모/회복, 정책 시너지
- Save/Load: best quarter 저장

## Game Spec 3 — Origami Rescue Grid
### Core Loop
- Input: 셀 선택 회전(터치), WASD/화살표 이동 + R 회전 + Enter 실행
- Action: 방향 타일을 회전해 종이 새를 출구까지 유도
- Reward: 최소 이동으로 클리어 시 별점과 점수 증가

### Systems
- Progression: 6개 스테이지, 장애물/회전 제한 증가
- Economy: 남은 에너지 기반 스코어 가산
- Save/Load: 최고 스테이지 저장

## Acceptance Criteria
- 3개 게임 모두 체크리스트 90% 이상
- `games/manifest.json` 신규 3개가 배열 맨 앞에 prepend
- `count: 119`, `updatedAt` 최신화
- 검증 및 gap analysis 기록 후 커밋/푸시