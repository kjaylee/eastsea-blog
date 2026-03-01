# Game Spec — p1m-games-batch-20260301-163322

## 목표
- 단일 배치로 신규 HTML5 게임 3종 제작 및 `games/manifest.json` 반영
- 기존 113개와 겹치지 않는 장르/코어 루프 제공
- PWA/모바일/저장/오디오 요구사항 충족

## 신규 게임 정의

### 1) Foglift Freight Signal (`foglift-freight-signal`)
- 장르: simulation / routing
- 코어 루프:
  - Input: 레인 선택 + 신호 모드 토글
  - Action: 도착 화물의 위험도에 맞춰 안전 레인으로 분류
  - Reward: 연속 처리 콤보/점수 상승
- 승패:
  - 오분류 또는 타임아웃 누적 5회 시 종료

### 2) Lumen Weave Atelier (`lumen-weave-atelier`)
- 장르: puzzle / pattern matching
- 코어 루프:
  - Input: 3x3 그리드 셀 색상 순환
  - Action: 목표 패턴과 동일하게 맞춤
  - Reward: 스테이지 클리어 + 남은 시간 보너스
- 승패:
  - 타이머 0초 도달 시 패널티, 3회 실패 시 종료

### 3) Meteor Noodle Kiosk (`meteor-noodle-kiosk`)
- 장르: arcade / time-management
- 코어 루프:
  - Input: 주문 슬롯 선택 + 조리 액션(끓이기/토핑/서빙)
  - Action: 제한시간 내 정확 조리 시퀀스 수행
  - Reward: 팁 포함 수익 점수, 스트릭 보너스
- 승패:
  - 주문 소각(만료) 5회 시 종료

## 공통 시스템
- 저장: `localStorage`에 best score 저장
- 오디오: Web Audio API oscillator 기반 SFX
- 입력: 터치(pointer) + 키보드 모두 제공
- 반응형: 390x844 포함 모바일 우선 레이아웃
- 테마: 네온 다크 (`#0a0a1a` 기반)
- 제약: 각 게임 `index.html` 단일 파일, 외부 의존성 없음, 파일 < 500KB
- PWA: 각 게임별 `manifest.webmanifest` 생성

## 산출물
- `games/foglift-freight-signal/index.html`
- `games/foglift-freight-signal/manifest.webmanifest`
- `games/lumen-weave-atelier/index.html`
- `games/lumen-weave-atelier/manifest.webmanifest`
- `games/meteor-noodle-kiosk/index.html`
- `games/meteor-noodle-kiosk/manifest.webmanifest`
- `games/manifest.json` (신규 3개 prepend, count=116)
