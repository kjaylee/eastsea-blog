# Spec — p1f-games-batch-20260301-1404

## 1) Objective
`eastsea-blog/games/`에 신규 HTML5 게임 3종을 제작/추가한다.

1. **plasma-pong** — 플라즈마 이펙트 네온 핑퐁, AI 대전, 파워업
2. **cipher-lock** — 암호 해독 퍼즐, 시간 제한, 10레벨
3. **spore-colony** — 세포 분열 시뮬레이션, 자원 관리, 무한 모드

## 2) Global Constraints (All 3)
- 단일 `index.html` (인라인 CSS/JS)
- 파일 크기 `< 500KB`
- 터치 + 키보드 입력 모두 지원
- Web Audio API 사운드 피드백
- localStorage 점수 저장/로드
- 모바일 반응형(390x844 기준 플레이 가능)
- 네온 다크 테마(핵심 배경 `#0a0a1a`)
- 에러 없는 HTML/JS (`node --check` 기준)
- 5+ 레벨 또는 무한 모드
- `manifest.webmanifest` 제공 + `<link rel="manifest">` 연결

## 3) Scope
### In Scope
- `games/plasma-pong/index.html`
- `games/cipher-lock/index.html`
- `games/spore-colony/index.html`
- 각 게임 `manifest.webmanifest`
- `games/manifest.json` 신규 3개 엔트리 추가 + count 동기화
- Gap Analysis 및 Launch Report 작성

### Out of Scope
- 외부 라이브러리/이미지/오디오 의존
- 기존 게임 파일 수정(신규 배치 외)
- 서버/백엔드 연동

## 4) Game Specs

### 4.1 Plasma Pong
- Core Loop:
  - Input: 터치 드래그/버튼 또는 키보드(↑↓/W,S)
  - Action: 패들 이동으로 볼을 반사, AI와 랠리, 파워업 획득
  - Reward: 점수 획득, 난이도 상승, 하이스코어 경신
- Systems:
  - AI paddle tracking + 실수 확률/속도 기반 난이도 상승
  - 파워업(패들 확장, 볼 슬로우, 점수 배수)
  - 생명(3) 기반 무한 모드(게임오버 전까지 계속 진행)
- Save/Load:
  - `localStorage.plasmaPongBestScore`

### 4.2 Cipher Lock
- Core Loop:
  - Input: 터치 키패드 또는 키보드 숫자 입력
  - Action: 제한 시간 내 암호 추측, 피드백(정확 위치/포함/불일치) 분석
  - Reward: 레벨 클리어, 잔여 시간 보너스 점수
- Systems:
  - 총 10레벨(길이/중복/시간 제한 점진 강화)
  - 레벨당 비밀 코드 생성(결정적 시드)
  - 추측 로그 + 피드백 히스토리
- Save/Load:
  - `localStorage.cipherLockBestScore`

### 4.3 Spore Colony
- Core Loop:
  - Input: 터치 UI 버튼 + 키보드 단축키
  - Action: 분열/채집/업그레이드/정화로 자원 순환 관리
  - Reward: 생존 시간 및 군체 규모 증가(무한 모드)
- Systems:
  - 자원 3종(에너지, 영양, 바이오매스)
  - 스포어 개체 수 증가 시 유지비 상승(난이도 상승)
  - 독성 구름 이벤트와 정화 액션
- Save/Load:
  - `localStorage.sporeColonyBestScore`

## 5) Acceptance Criteria
1. 게임 3개 모두 플레이 가능하고 핵심 루프 동작
2. 터치 + 키보드 입력 둘 다 확인 가능
3. Web Audio API 호출 포함
4. localStorage 점수 저장/로드 키 존재
5. Plasma Pong/Spore Colony는 무한 모드, Cipher Lock은 10레벨 제공
6. `manifest.webmanifest` 3개 존재 + link 연결
7. 각 `index.html` 파일 크기 `< 500KB`
8. 인라인 JS 추출 후 `node --check` 통과
9. `games/manifest.json` 신규 3개 추가 + `count === games.length`
10. Gap Analysis 점수 90% 이상 달성(최대 3회 반복)
