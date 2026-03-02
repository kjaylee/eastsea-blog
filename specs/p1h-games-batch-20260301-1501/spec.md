# Game Spec — p1h-games-batch-20260301-1501

## 목표
`eastsea-blog/games/`에 신규 HTML5 게임 3종(퍼즐/액션/시뮬) 제작 및 `games/manifest.json` 반영.

## 신규 게임 정의

### 1) Timeline Switchyard (퍼즐)
- **slug**: `timeline-switchyard`
- **카테고리**: `puzzle`
- **코어 루프**: 이동(방향키/터치) → 타임라인 전환(T) → 오브 수집 → 출구 도달
- **진행 구조**: 6개 레벨 고정 맵, 레벨 클리어 시 다음 레벨 해금
- **차별점**: 동일 좌표에서 과거/미래 벽 배치가 달라지는 2계층 퍼즐

### 2) Neon Courier Drift (액션)
- **slug**: `neon-courier-drift`
- **카테고리**: `action`
- **코어 루프**: 이동 조작(키보드/터치 드래그) → 패킷 수집 → 추적 드론 회피 → 난이도 상승
- **진행 구조**: 무한 모드(점수 기반 난이도 증가)
- **차별점**: 실시간 벡터 드리프트 이동 + 위험도 스케일링

### 3) Gridshift Overseer (시뮬)
- **slug**: `gridshift-overseer`
- **카테고리**: `simulation`
- **코어 루프**: 발전기 on/off(1~5 키/터치) → 수요-공급 밸런스 유지 → 과열/정전 관리
- **진행 구조**: 무한 데이 사이클 + 티어 상승
- **차별점**: 실시간 전력망 운영/리스크 관리 마이크로 시뮬

## 공통 기술/품질 제약
1. 각 게임은 **단일 `index.html`**로 구성, 파일 크기 **500KB 미만**.
2. 필수 체크리스트:
   - 터치 + 키보드 입력 동시 지원
   - Web Audio API 사용
   - localStorage 최고기록 저장
   - 모바일 반응형 레이아웃
   - `manifest.webmanifest` 제공(PWA 메타 연결)
   - 네온 다크 배경(`#0a0a1a` 기반)
   - 5+레벨 또는 무한 모드
3. JS 문법 검증: `node --check` 통과.
4. `games/manifest.json`에 신규 3개를 **prepend**하고 `count`, `updatedAt` 갱신.

## 저장 데이터
- Timeline Switchyard: 최고 해금 레벨
- Neon Courier Drift: 최고 점수
- Gridshift Overseer: 최고 데이/크레딧

## 완료 기준 (DoD)
- 신규 게임 3개 폴더 + `index.html` + `manifest.webmanifest` 생성
- 체크리스트 충족률 90% 이상(목표 100%)
- `games/manifest.json` 반영 완료
- `node --check` 증적 확보
