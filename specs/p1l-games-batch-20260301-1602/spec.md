# Game Spec — p1l-games-batch-20260301-1602

## 목표
`eastsea-blog/games/`에 신규 HTML5 게임 3종을 제작하고 `games/manifest.json`에 신규 항목 3개를 **맨 앞 prepend**로 반영한다.

## 사전 검증
- 기존 slug 목록(`ls games/`) 확인 완료.
- 신규 slug 3개 모두 기존 110개와 중복 없음.
  - `aurora-threadline-pilot`
  - `kintsugi-circuit`
  - `mycelium-signal-lab`

## 신규 게임 정의

### 1) Aurora Threadline Pilot (Action)
- **slug**: `aurora-threadline-pilot`
- **cat**: `action`
- **코어 루프**: 플레이어가 좌우 이동 + 부스트로 오로라 라인을 따라 비행 → 에너지 오브 회수 → 폭풍 노드 회피
- **입력**: 키보드(←/→/A/D, Space), 터치(좌/우/부스트 버튼)
- **저장**: 최고 점수(localStorage)
- **차별점**: 곡선형 “threadline”을 유지할수록 보너스가 붙는 라인-트래킹 액션

### 2) Kintsugi Circuit (Puzzle)
- **slug**: `kintsugi-circuit`
- **cat**: `puzzle`
- **코어 루프**: 깨진 회로 타일(회전 가능)을 정렬해 전원 Source→Sink 연결
- **입력**: 키보드(방향키 이동, Enter/Space 회전), 터치(타일 탭 회전)
- **저장**: 최고 클리어 레벨(localStorage)
- **차별점**: 금빛 균열(kintsugi) 테마의 회로 복원 퍼즐 + 제한 이동수 기반 별점

### 3) Mycelium Signal Lab (Simulation)
- **slug**: `mycelium-signal-lab`
- **cat**: `simulation`
- **코어 루프**: 균사 네트워크의 수분/당분/전도도를 조절해 신호 안정도를 목표 범위에 유지
- **입력**: 키보드(1/2/3 구역 선택, Q/W/E 조절), 터치(패널 버튼)
- **저장**: 최고 생존 사이클(localStorage)
- **차별점**: 실시간 바이오-네트워크 안정화 운영 시뮬레이션

## 공통 제약 / 체크리스트
1. 각 게임은 `index.html` 단일 파일(외부 라이브러리/의존성 없음)
2. `manifest.webmanifest` 파일 제공 + HTML에서 링크
3. 터치 + 키보드 입력 둘 다 지원
4. Web Audio API 효과음 경로 포함
5. localStorage 저장/복원 포함
6. 모바일 반응형(390x844 포함)
7. 네온 다크 테마 베이스 `#0a0a1a`
8. 파일 크기 각 `< 500KB`

## 완료 기준
- 3개 게임 구현 + 정적 검증 + 체크리스트 점수 90% 이상(목표 100%)
- `games/manifest.json`에 신규 3개 prepend + `count: 113` + `updatedAt` 갱신
- `gap-analysis.md`에 반복 점검 결과 기록
