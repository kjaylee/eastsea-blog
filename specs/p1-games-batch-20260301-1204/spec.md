# Game Spec — p1-games-batch-20260301-1204

## Scope
Batch P1c 신규 HTML5 게임 3종 제작:
1. `magnet-maze` — 자석 극성 전환 미로 탈출
2. `waveform-rider` — 파형 서핑 장애물 회피 (무한 모드)
3. `prism-split` — 프리즘 분광 + 반사각 색상 타겟 퍼즐

경로 기준:
- 게임 루트: `$WORKSPACE/eastsea-blog/games/`
- 스펙 루트: `$WORKSPACE/eastsea-blog/specs/p1-games-batch-20260301-1204/`

## Global Product Constraints
- Single HTML delivery per game (`index.html` only, inline CSS/JS)
- Mobile-first responsive UI
- Neon dark visual theme with base `#0a0a1a`
- Touch + keyboard input 모두 지원
- Web Audio API 효과음 포함
- localStorage 기반 최고 기록 저장
- PWA manifest 존재
- JS 문법 `node --check` 통과
- 파일 크기 `< 500KB`
- 각 게임 5+ 레벨 또는 무한 모드 충족

## Game Specs

### 1) Magnet Maze
- **Core Loop**
  - Input: 방향키/WASD 또는 터치 D-pad로 이동, Space/버튼으로 N/S 극성 토글
  - Action: 벽/자석 배치가 있는 격자 미로에서 극성 상호작용(흡인/반발)을 활용해 출구 도달
  - Reward: 레벨 클리어 시 점수 획득 + 다음 레벨 해금
- **Systems**
  - Progression: 6개 레벨(장애물/자석 밀도 증가)
  - Fail State: 함정 타일 접촉 시 시작점 리스폰 + 패널티
  - Save/Load: 최고 도달 레벨 localStorage (`magnetMazeBestLevel`)

### 2) Waveform Rider
- **Core Loop**
  - Input: ↑/↓(진폭), ←/→(주파수), 터치 ± 버튼
  - Action: 사인파 궤적을 실시간 조절해 다가오는 장애물 회피
  - Reward: 생존 시간/거리 기반 점수 누적
- **Systems**
  - Mode: Endless (무한 모드)
  - Difficulty: 시간 경과에 따라 속도/장애물 밀도 증가
  - Save/Load: 최고 점수 localStorage (`waveformRiderBest`)

### 3) Prism Split
- **Core Loop**
  - Input: A/D(프리즘 각도), J/L(미러 각도), 터치 각도 버튼
  - Action: 백색광을 프리즘에서 RGB로 분리하고 반사 미러 각도를 조절해 색상 타겟 적중
  - Reward: 각 레벨 목표 색상 타겟 모두 적중 시 클리어
- **Systems**
  - Progression: 6개 퍼즐 레벨(타겟 위치/허용 오차 조정)
  - Reflection: 단일 미러 반사(입사각=반사각) 계산
  - Save/Load: 최고 레벨 localStorage (`prismSplitBestLevel`)

## Implementation Plan
1. 공통 네온 테마 + 반응형 레이아웃 + HUD/컨트롤 구성
2. 각 게임 핵심 메커닉 및 상태 전이 구현
3. Web Audio API 효과음 및 localStorage 반영
4. PWA manifest 작성 + HTML manifest 링크 연결
5. `games/manifest.json` 신규 3개 엔트리 추가
6. 정적 검증(파일 크기, node --check, 체크리스트 적합성) 수행
7. Gap Analysis 점수 산정 및 90% 이상 확인
