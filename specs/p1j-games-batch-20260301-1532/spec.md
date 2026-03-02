# Game Spec — p1j-games-batch-20260301-1532

## 목표
`eastsea-blog/games/`에 신규 HTML5 게임 3종을 제작하고 `games/manifest.json`에 prepend 반영한다.

## 사전 검증
- `games/manifest.json`의 전체 slug 104개 확인 완료.
- 신규 slug(`mirror-vault-heist`, `tidal-signal-operator`, `skyline-seed-runner`)는 기존과 중복 없음.

## 신규 게임 정의

### 1) Mirror Vault Heist (Puzzle/Stealth)
- **slug**: `mirror-vault-heist`
- **cat**: `puzzle`
- **코어 루프**: 이동(방향키/터치) → 미러 모드 전환(Space) → 레이저 회피 + 데이터 키 수집 → 금고 탈출
- **진행 구조**: 6개 고정 스테이지
- **차별점**: 플레이어와 미러 아바타가 대칭 이동하며 동시에 안전 구역에 들어가야 클리어

### 2) Tidal Signal Operator (Harbor Simulation)
- **slug**: `tidal-signal-operator`
- **cat**: `simulation`
- **코어 루프**: 파고/안개/조류 모니터링 → 등대빔/경고등/사이렌 출력 조절(키보드+터치) → 선박 안전 통과 관리
- **진행 구조**: 무한 교대(Shift) + 난이도 상승
- **차별점**: 실시간 위험지수 관리형 항만 관제 시뮬레이션

### 3) Skyline Seed Runner (Action)
- **slug**: `skyline-seed-runner`
- **cat**: `action`
- **코어 루프**: 드론 이동(키보드/터치) → 씨앗 캡슐 수거/투하 → 바람 장벽 회피 → 연속 배달 콤보
- **진행 구조**: 무한 생존 런
- **차별점**: 바람 벡터에 따라 관성 드리프트가 바뀌는 도심 생태 복원 액션

## 공통 제약
1. 게임별 산출물: `index.html` + `manifest.webmanifest`만 사용.
2. 필수 체크리스트: 터치+키보드, Web Audio API, localStorage 최고기록, 모바일 반응형, PWA manifest, 네온 다크 `#0a0a1a`, 파일 < 500KB.
3. `node --check` 기반 JS 문법 검증.
4. `games/manifest.json`는 신규 3개를 배열 맨 앞에 prepend, `count`/`updatedAt` 갱신.

## 완료 기준
- 신규 3종 구현 완료 + 체크리스트 90% 이상(목표 100%)
- 검증 증적(node check, 파일 크기, gap analysis) 기록 완료
