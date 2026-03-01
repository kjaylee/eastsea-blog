# Test Cases — P1 Games Batch (ion-sail-trench-run / cipher-garden-weaver / tempo-smelter-director)

## Common
- TC-COM-001: 각 게임 첫 렌더 시 콘솔 에러 없이 화면 표시
- TC-COM-002: 390x844 기준 가로 스크롤 없이 UI 사용 가능
- TC-COM-003: 키보드 입력으로 핵심 조작 가능
- TC-COM-004: 터치 입력(온스크린 버튼/패드)으로 동일 조작 가능
- TC-COM-005: 사용자 입력 이후 Web Audio API 효과음 재생
- TC-COM-006: 최고 기록이 localStorage에 저장되고 재시작 시 복원
- TC-COM-007: 배경/테마 컬러 `#0a0a1a` 적용
- TC-COM-008: 각 `index.html` 파일 500KB 미만
- TC-COM-009: 각 폴더 `manifest.webmanifest` 존재 및 start_url 일치

## ion-sail-trench-run
- TC-ISR-001: 좌/우 이동(ArrowLeft/Right, A/D, 터치 버튼) 동작
- TC-ISR-002: 코어 수집 시 점수/콤보 증가
- TC-ISR-003: 장애물 충돌 시 선체 감소, 0이면 게임오버

## cipher-garden-weaver
- TC-CGW-001: 셀 탭/키보드로 토글 가능
- TC-CGW-002: 현재 보드가 목표 패턴과 일치하면 스테이지 클리어
- TC-CGW-003: 스테이지 상승 시 목표 패턴 난이도 증가

## tempo-smelter-director
- TC-TSD-001: 좌/중/우 입력(←/↓/→ 또는 터치) 타이밍 판정
- TC-TSD-002: 정타 시 출력 점수 상승, 오타/미스 시 열(heat) 상승
- TC-TSD-003: heat 100 도달 시 게임오버, 재시작 가능
