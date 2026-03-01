# Test Cases — p1m-games-batch-20260301-163322

## 공통 기능 테스트 (모든 게임 공통)
- TC-C001: 타이틀/초기 HUD 렌더링
- TC-C002: Start -> Play 상태 전환
- TC-C003: Game Over -> Restart 정상 동작
- TC-C004: 터치 입력(pointerdown)으로 핵심 액션 수행
- TC-C005: 키보드 입력(keydown)으로 핵심 액션 수행
- TC-C006: Web Audio API 컨텍스트 생성 및 SFX 호출
- TC-C007: localStorage best score 저장/복원
- TC-C008: 390x844 모바일 뷰에서 UI 깨짐 없음
- TC-C009: `manifest.webmanifest` 존재 및 theme/background `#0a0a1a`
- TC-C010: 단일 파일(외부 JS/CSS 의존성 없음)
- TC-C011: `index.html` 파일 크기 500KB 미만

## 게임별 시나리오

### Foglift Freight Signal
- TC-F001: 화물 도착 시 레인별 분류 가능
- TC-F002: 위험도 규칙에 맞는 분류 시 점수 증가
- TC-F003: 오분류/타임아웃 누적 시 life 감소 및 종료

### Lumen Weave Atelier
- TC-L001: 셀 클릭/키 조작으로 색상 순환
- TC-L002: 목표 패턴 일치 시 다음 스테이지 진입
- TC-L003: 시간 초과 3회 시 종료

### Meteor Noodle Kiosk
- TC-M001: 주문 생성 및 슬롯 선택 동작
- TC-M002: 조리 시퀀스 정확 시 서빙 성공/점수 증가
- TC-M003: 만료 주문 누적 5회 시 종료

## 검증 명령(증거)
- `ls games/{slug}`
- `wc -c games/{slug}/index.html`
- `rg "localStorage|AudioContext|pointerdown|keydown" games/{slug}/index.html`
- `cat games/{slug}/manifest.webmanifest`
- `node -e "JSON.parse(require('fs').readFileSync('games/manifest.json','utf8')); console.log('ok')"`
