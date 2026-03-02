# Spec — p1-games-batch-20260301-1230

## 1) Objective
`eastsea-blog/games/`에 신규 HTML5 게임 3종을 제작/추가한다.

1. **quantum-bounce** — 관측 시에만 충돌/반사가 일어나는 양자 바운스 퍼즐
2. **ink-flow** — 수묵 잉크 경로를 그려 목표로 흐르게 하는 퍼즐
3. **gear-train** — 입력/출력 기어를 연결해 방향·RPM 조건을 맞추는 기어 로직 퍼즐

## 2) Global Constraints (All 3)
- 단일 `index.html` (인라인 CSS/JS)
- 파일 크기 `< 500KB`
- 터치 + 키보드 입력
- Web Audio API 사운드
- localStorage 최고 기록 저장
- 모바일 반응형
- 네온 다크 테마 (배경 `#0a0a1a`)
- 에러 없는 HTML/JS (`node --check` 기준)
- 5+ 레벨 또는 무한 모드
- `manifest.webmanifest` 제공 + `link rel="manifest"` 연결

## 3) Scope
### In Scope
- `games/quantum-bounce/index.html`
- `games/ink-flow/index.html`
- `games/gear-train/index.html`
- `games/{quantum-bounce,ink-flow,gear-train}/manifest.webmanifest`
- `games/manifest.json` 신규 3개 엔트리 추가
- Gap Analysis + Launch Report 작성

### Out of Scope
- 외부 라이브러리/에셋 추가
- 멀티파일 구조 개편
- 기존 게임 로직 수정

## 4) Game Specs

### 4.1 Quantum Bounce
- Core: 발사 각도를 맞춘 뒤 공 이동 중 `관측(Observe)`을 유지할 때만 벽/장애물 반사 발생
- Goal: 관측 상태로 타겟 코어 적중 시 레벨 클리어
- Progression: 8레벨(장애물 배치/타이밍 난이도 증가)
- Input:
  - Touch: 캔버스 드래그 조준, Launch 버튼, Observe 홀드 버튼
  - Keyboard: ←/→ 각도, Enter 발사, Space 관측 홀드, R 리셋
- Save: 최고 해금 레벨(localStorage)

### 4.2 Ink Flow
- Core: 소스에서 목표까지 잉크 경로를 그리고 실행하여 게이트를 모두 통과
- Goal: 경로 끝이 Goal이고 필수 게이트 통과 시 클리어
- Progression: 6레벨(장애물/게이트 밀도 증가)
- Input:
  - Touch: 셀 드래그 경로 그리기
  - Keyboard: 화살표로 경로 확장, Backspace 되돌리기, Enter 흐름 실행
- Save: 최고 해금 레벨(localStorage)

### 4.3 Gear Train
- Core: 격자에 중간 기어(8/12/16 teeth)를 배치해 입력→출력 연결
- Goal: 출력 기어의 회전 방향(CW/CCW)과 RPM 목표를 동시에 만족
- Progression: 6레벨(출력 위치 parity + blocker로 경로 퍼즐화)
- Input:
  - Touch: 셀 탭으로 기어 타입 순환
  - Keyboard: 화살표 커서 이동, Space/Enter 배치, C 클리어
- Save: 최고 해금 레벨(localStorage)

## 5) Acceptance Criteria
1. 게임 3개 모두 로딩/플레이 가능
2. 터치 + 키보드 입력 모두 동작
3. Web Audio API 호출 포함
4. localStorage 저장/로드 키 존재
5. 각 게임 5+ 레벨 또는 무한 모드 충족
6. `manifest.webmanifest` 3개 존재 + HTML 링크 연결
7. 각 `index.html` < 500KB
8. 인라인 JS 추출 `node --check` 통과
9. `games/manifest.json` 신규 3개 추가 + count 동기화
