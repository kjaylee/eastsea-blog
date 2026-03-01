# Game Spec — p1o-games-batch-20260301-170223

## 목표
`eastsea-blog/games/`에 신규 HTML5 게임 3종을 제작하고 `games/manifest.json`에 prepend 반영한다.

## 사전 검증
- `ls games/`로 기존 slug 확인 완료.
- 신규 slug(`braille-beacon-operator`, `thermal-drone-orchard`, `gravity-calligraphy-duel`)는 기존 디렉토리와 중복 없음.

## 신규 게임 정의

### 1) Braille Beacon Operator (Education / Reflex)
- **slug**: `braille-beacon-operator`
- **cat**: `education`
- **코어 루프**: 점자 셀(6-dot) 패턴 점멸 확인 → 제시된 4개 문자 중 정답 선택(키보드 1~4 또는 터치) → 연속 정답으로 난이도 상승
- **진행 구조**: 60초 타임어택 + 콤보 기반 점수
- **차별점**: 점자 인지 + 반응속도를 결합한 학습형 아케이드

### 2) Thermal Drone Orchard (Simulation)
- **slug**: `thermal-drone-orchard`
- **cat**: `simulation`
- **코어 루프**: 3개 구역의 온도/수분 모니터링 → 스캔/관수/환기 드론 커맨드 배분(키보드+터치) → 과열·건조·병충해 리스크 제어
- **진행 구조**: 무한 Shift 운영, 라운드별 난이도 상승
- **차별점**: 실시간 지표 밸런싱 기반 농업 운영 시뮬레이션

### 3) Gravity Calligraphy Duel (Arcade / Precision)
- **slug**: `gravity-calligraphy-duel`
- **cat**: `arcade`
- **코어 루프**: 중력 우물(3개)을 좌우/세기 조절해 잉크 오브 궤적을 휘게 만듦 → 목표 획 게이트 통과 → 연속 클리어로 속도 상승
- **진행 구조**: 웨이브 기반 무한 모드
- **차별점**: 실시간 중력 벡터 제어로 붓획을 그리는 정밀 액션

## 공통 제약
1. 게임별 산출물: `index.html` + `manifest.webmanifest`만 사용 (외부 의존성 없음).
2. 필수 체크리스트: 터치+키보드, Web Audio API, localStorage 최고기록/진행, 모바일 반응형, PWA manifest, 네온 다크 `#0a0a1a`, 파일 < 500KB.
3. 구현 후 Gap Analysis 수행, 체크리스트 90% 미만 시 자동 수정(최대 3회).
4. `games/manifest.json`는 신규 3개를 배열 맨 앞 prepend, `count=122`, `updatedAt` 갱신.

## 완료 기준
- 신규 3종 구현 완료
- 테스트 케이스 실행 증적 + 갭 분석 90% 이상 확보
- manifest 반영 및 git commit/push 완료
