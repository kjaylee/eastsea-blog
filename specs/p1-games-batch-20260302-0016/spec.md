# Spec — p1-games-batch-20260302-0016

## 1) Objective
`eastsea-blog/games/`에 신규 HTML5 게임 3종을 제작/추가한다.

1. **tidal-choir-router** — 파도 펄스를 회전 노드로 연결해 합창 타워에 동기화시키는 라우팅 퍼즐
2. **ferro-reef-ballast** — 좌우 밸러스트를 조절해 잠수정 기울기와 수심 충격을 버티는 생존 액션
3. **zenith-ziplane-rescue** — 고산 지플레인으로 조난자를 수색·탑승·구출하는 스카이 아케이드

## 2) Global Constraints (All 3)
- 단일 `index.html` (인라인 CSS/JS)
- 외부 의존성 없음
- 파일 크기 `< 500KB`
- 터치 + 키보드 입력
- Web Audio API 사운드
- localStorage 최고 기록 저장
- 모바일 반응형
- 네온 다크 테마 (배경 `#0a0a1a`)
- `manifest.webmanifest` 제공 + `link rel="manifest"` 연결

## 3) Scope
### In Scope
- `games/tidal-choir-router/index.html`
- `games/ferro-reef-ballast/index.html`
- `games/zenith-ziplane-rescue/index.html`
- 각 게임의 `manifest.webmanifest`
- `games/manifest.json`에 신규 3개 prepend + count/updatedAt 갱신
- Gap Analysis 및 품질 점수화

### Out of Scope
- 기존 게임 리팩터링
- 외부 라이브러리/이미지/오디오 에셋 도입
- 멀티플레이/백엔드 기능

## 4) Game Specs

### 4.1 Tidal Choir Router (Puzzle)
- Core: 6x6 그리드의 라우터 타일을 회전해 소스 파도 펄스를 모든 합창 타워로 전달
- Goal: 제한 턴 이내 모든 타워에 신호 전달 시 라운드 클리어
- Progression: 7라운드(장애 타일/턴 제한 강화)
- Input:
  - Touch: 셀 탭으로 타일 회전, Pulse 버튼으로 시뮬레이션
  - Keyboard: 화살표 커서 이동, Space 회전, Enter Pulse, R 재시작
- Save: 최고 라운드(localStorage)

### 4.2 Ferro Reef Ballast (Action)
- Core: 좌우 밸러스트를 조절해 잠수정의 기울기를 안정화하고 암초 충돌 회피
- Goal: 압력/선체 내구도 소진 전 최대 거리 달성
- Progression: 시간 경과에 따른 파도/충격 강도 증가(무한 모드)
- Input:
  - Touch: 좌/우 밸러스트 버튼 홀드, Surface Burst 버튼
  - Keyboard: ←/→ 밸러스트, ↑ Burst, R 재시작
- Save: 최고 거리(localStorage)

### 4.3 Zenith Ziplane Rescue (Arcade)
- Core: 지플레인 고도와 속도를 제어해 조난자를 태우고 구조 지점에 하차
- Goal: 연료 고갈 전 최대 구조 수 달성
- Progression: 바람 세기/구름 장애물/조난자 빈도 상승(무한 모드)
- Input:
  - Touch: 상승/하강/부스트 버튼, 탑승·하차 버튼
  - Keyboard: W/S 고도, Shift 부스트, Space 탑승·하차, R 재시작
- Save: 최고 구조 수(localStorage)

## 5) Acceptance Criteria
1. 게임 3개 모두 로드/플레이 가능
2. 터치 + 키보드 입력 모두 동작
3. Web Audio API 호출 포함
4. localStorage 저장/로드 키 존재
5. 모바일 반응형 + `#0a0a1a` 포함
6. `manifest.webmanifest` 존재 + HTML 연결
7. 각 `index.html` < 500KB
8. `games/manifest.json` 신규 3개 prepend, `count=197`, `games.length` 동기화
9. 체크리스트 점수 90점 이상
