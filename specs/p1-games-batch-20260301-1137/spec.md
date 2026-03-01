# Game Spec — p1-games-batch-20260301-1137

## Scope
Batch P1로 신규 HTML5 게임 3종 제작:
1. `signal-scramble` (신호 해독 퍼즐)
2. `orbit-weaver` (중력 궤도 설계 시뮬레이션)
3. `pixel-alchemist` (RGB 정밀 색상 조합 퍼즐)

경로 기준:
- 게임 루트: `$WORKSPACE/eastsea-blog/games/`
- 스펙 루트: `$WORKSPACE/eastsea-blog/specs/p1-games-batch-20260301-1137/`

## Global Product Constraints
- Single HTML delivery per game (`index.html` only)
- Mobile-first responsive UI
- Neon dark visual theme with base `#0a0a1a`
- Touch + keyboard both required
- Web Audio API feedback effects required
- localStorage score persistence required
- PWA manifest presence required
- Max file size per game `< 500KB`

## Game Specs

### 1) Signal Scramble
- **Core Loop**
  - Input: 1/2/3 key 또는 버튼/터치로 채널 선택
  - Action: 노이즈가 섞인 3개 신호 중 반복 패턴이 더 안정적인 진짜 신호 식별
  - Reward: 정답 시 점수 증가 + 레벨 상승, 오답 시 라이프 감소
- **Systems**
  - Progression: 레벨 상승 시 패턴 길이/잡음 난도 상승
  - Save/Load: 최고 점수 localStorage 저장 (`signalScrambleBest`)
  - UX: 캔버스 스코프 렌더 + 스캔라인 시각효과

### 2) Orbit Weaver
- **Core Loop**
  - Input: 드래그(터치/마우스) 또는 방향키로 발사 벡터 설정, Space/Launch 발사
  - Action: 행성 중력 하에서 위성을 목표 시간 이상 안정적으로 유지
  - Reward: 성공 시 레벨/점수 상승, 실패 시 재시도
- **Systems**
  - Physics: 뉴턴식 중력 가속 근사 + 속도/위치 적분
  - Progression: 레벨별 목표 유지 시간 증가, 중력 상수 강화
  - Save/Load: 최고 레벨 localStorage 저장 (`orbitWeaverBestLevel`)

### 3) Pixel Alchemist
- **Core Loop**
  - Input: RGB 슬라이더(터치) + 키보드(Q/A, W/S, E/D)
  - Action: 타겟 RGB 색상에 최대한 근접하도록 혼합 후 Mix
  - Reward: 정확도 기반 점수 획득, 라운드 증가
- **Systems**
  - Scoring: 유클리드 색상 거리 기반 정확도(0~100%)
  - Progression: 라운드 누적 점수 경쟁
  - Save/Load: 최고 점수 localStorage 저장 (`pixelAlchemistBestScore`)

## Implementation Plan
1. 공통 네온 다크 테마 및 반응형 레이아웃 구성
2. 각 게임 핵심 루프 구현 (입력/상태/렌더)
3. Web Audio API 액션 피드백 결합
4. localStorage 저장/로드 로직 결합
5. 각 HTML 내 PWA manifest 링크 삽입
6. 파일 크기, 정적 체크, QA 테스트 수행
7. `games/manifest.json` 엔트리/메타데이터 갱신
