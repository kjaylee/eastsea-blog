# P1 Games Batch Spec — 20260302-000951

## Goal
3개의 신규 HTML5 게임을 `games/{slug}/index.html` + `games/{slug}/manifest.webmanifest` 형태로 구현하고,
`games/manifest.json`에 prepend 등록한다.

## New Game Set (Unique Concepts)

### 1) orbital-packet-weaver (arcade)
- **Core loop**: 좌/우 이동으로 드롭되는 패킷을 받되, 수신 채널(3색)과 패킷 채널을 일치시켜 점수 획득.
- **Inputs**:
  - Keyboard: `←/→` 이동, `A/S/D` 또는 `1/2/3` 채널 전환
  - Touch: Left/Right 버튼 + 3채널 버튼
- **Failure**: 채널 불일치 수신/미수신 시 Shield 감소, 0이면 종료.
- **Persistence**: 최고 점수 localStorage 저장.

### 2) treaty-terminal-director (strategy)
- **Core loop**: 외교 이슈 이벤트마다 3개 응답(지원/보호/개혁) 중 적합한 조치를 제한 시간 내 선택.
- **Systems**:
  - 리소스: Trust, Budget, Stability
  - 적중 시 점수/콤보 증가, 오판 시 리소스 감소
  - 리소스 0 도달 시 종료
- **Inputs**:
  - Keyboard: `1/2/3` 액션 선택
  - Touch: 액션 버튼 터치
- **Persistence**: 최고 점수 localStorage 저장.

### 3) balance-beacon-foundry (puzzle/skill)
- **Core loop**: 좌/우 플랫폼에 블록을 떨어뜨려 균형값(tilt)을 허용 범위 내 유지.
- **Mechanic**:
  - 블록 종류(무게)가 랜덤 생성
  - 균형 유지 시간 증가 시 난이도 상승
  - tilt 한계 초과 지속 시 붕괴(게임오버)
- **Inputs**:
  - Keyboard: `ArrowLeft`/`ArrowRight` 드롭 위치, `Space` 드롭
  - Touch: Left/Right/Drop 버튼
- **Persistence**: 최고 생존 점수 localStorage 저장.

## Global Constraints (Must Pass)
1. 단일 파일: 각 게임 로직/스타일/마크업은 `index.html` 단일 파일
2. 외부 의존성 없음 (CDN, npm, 외부 asset 미사용)
3. Web Audio API 사용 (효과음)
4. localStorage 저장/로드 동작
5. 모바일 반응형 (최대 폭 제한 + 작은 화면 레이아웃 대응)
6. PWA `manifest.webmanifest` 포함
7. 배경/테마 컬러: `#0a0a1a` 기반 네온 다크
8. 파일 크기: 각 `index.html` 500KB 미만

## Deliverables
- `games/orbital-packet-weaver/index.html`
- `games/orbital-packet-weaver/manifest.webmanifest`
- `games/treaty-terminal-director/index.html`
- `games/treaty-terminal-director/manifest.webmanifest`
- `games/balance-beacon-foundry/index.html`
- `games/balance-beacon-foundry/manifest.webmanifest`
- `games/manifest.json` (신규 3개 prepend, count+updatedAt 갱신)
- 검증 문서: `specs/p1-games-batch-20260302-000951/test-cases.md`, `plan.md`, `gap-analysis.md`
