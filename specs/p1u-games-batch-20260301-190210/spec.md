# P1u Games Batch Spec — 20260301-190210

## 목표
기존 140개 게임과 중복되지 않는 신규 HTML5 게임 3종을 `games/{slug}/index.html` + `games/{slug}/manifest.webmanifest` 형태로 제작하고, `games/manifest.json`에 prepend 반영해 총 143개로 갱신한다.

## 신규 게임 정의

### 1) Crystal Echo Luthier (`crystal-echo-luthier`) — Rhythm/Puzzle
- 컨셉: 공명하는 4개 크리스털 현의 목표 패턴을 기억/재현하는 리듬-메모리 게임.
- 코어 루프:
  - Input: 키보드 A/S/D/F 또는 터치 패드 4개
  - Action: 시퀀스를 입력해 정확 판정과 콤보 축적
  - Reward: 점수/라운드 증가, 정확도 기반 보너스
- 실패 조건: 라이프 0 또는 제한 시간 종료
- 저장: bestScore, bestRound(localStorage)

### 2) Midnight Harbor Pilotage (`midnight-harbor-pilotage`) — Action/Navigation
- 컨셉: 야간 항구에서 파일럿 보트를 3레인 이동+부스트로 조작해 암초를 회피하고 표지 부이를 연결 수거.
- 코어 루프:
  - Input: ←/→, Space(부스트), 터치 좌/우/부스트
  - Action: 장애물 회피 + 연속 부이 수집
  - Reward: 거리/스트릭 점수 및 속도 증가
- 실패 조건: 선체 내구도 0
- 저장: bestDistance, bestScore(localStorage)

### 3) Archive Automata Curator (`archive-automata-curator`) — Strategy/Management
- 컨셉: 고장나는 자동보관 아카이브(3섹션)를 스캔/수리/냉각/정리 액션으로 운영하며 안정도 유지.
- 코어 루프:
  - Input: 1/2/3 섹션 선택 + Q/W/E/R 액션, 터치 버튼
  - Action: 자원(전력/열/무결성) 트레이드오프 관리
  - Reward: 웨이브/점수 상승, 난이도 증가
- 실패 조건: 전체 무결성 임계치 이하
- 저장: bestWave, bestScore(localStorage)

## 공통 제품 요구사항
1. 단일 파일 게임: 각 게임 로직/스타일/마크업은 `index.html` 내부 완결(외부 라이브러리 금지)
2. 입력: 키보드 + 터치 동시 지원
3. 오디오: Web Audio API로 효과음 재생
4. 저장: localStorage 최고 기록 저장/로드
5. 반응형: 모바일(390x844 기준)에서 플레이 가능
6. 스타일: `#0a0a1a` 기반 네온 다크 테마
7. PWA: 각 게임에 `manifest.webmanifest` 제공
8. 용량: 각 `index.html` 파일 500KB 미만

## 산출물
- `games/crystal-echo-luthier/index.html`
- `games/crystal-echo-luthier/manifest.webmanifest`
- `games/midnight-harbor-pilotage/index.html`
- `games/midnight-harbor-pilotage/manifest.webmanifest`
- `games/archive-automata-curator/index.html`
- `games/archive-automata-curator/manifest.webmanifest`
- `games/manifest.json` (신규 3개 prepend, count/updatedAt 갱신)

## 완료 기준
- 3개 게임 정상 실행 + 체크리스트 90점 이상
- `games/manifest.json` count=143
- 신규 3개 항목이 games 배열 맨 앞 3개에 위치
- git commit + push 완료
