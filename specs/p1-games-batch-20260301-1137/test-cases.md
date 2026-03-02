# Test Cases — p1-games-batch-20260301-1137

## Common Gate (All 3 Games)
- TC-C001: `index.html` 단일 파일 존재
- TC-C002: 파일 크기 `< 500KB`
- TC-C003: viewport + 모바일 반응형 CSS 존재
- TC-C004: 배경 테마 `#0a0a1a` 적용
- TC-C005: Web Audio API 호출 경로 존재 (`AudioContext`)
- TC-C006: localStorage 저장 키/읽기 로직 존재
- TC-C007: 키보드 입력 핸들러 존재 (`keydown`)
- TC-C008: 터치/포인터 입력 핸들러 존재 (`touchstart` 또는 `pointer*`)
- TC-C009: PWA manifest 링크 주입/선언 존재

## Signal Scramble
- TC-S001: START 시 라운드 생성
- TC-S002: 3개 채널 선택 UI 렌더
- TC-S003: 정답 선택 시 점수 + 레벨 증가
- TC-S004: 오답 선택 시 라이프 감소
- TC-S005: 라이프 0 시 게임 종료 처리
- TC-S006: 최고 점수 localStorage 반영

## Orbit Weaver
- TC-O001: 발사 전 벡터 조준선 표시
- TC-O002: Launch/Space로 시뮬레이션 시작
- TC-O003: 충돌/이탈 실패 판정
- TC-O004: 목표 유지 시간 달성 시 레벨 클리어
- TC-O005: 최고 레벨 localStorage 반영

## Pixel Alchemist
- TC-P001: 타겟 색상 랜덤 생성
- TC-P002: RGB 슬라이더 및 키 입력으로 값 변경
- TC-P003: Mix 시 정확도 계산(0~100%)
- TC-P004: 정확도 기반 점수 누적
- TC-P005: 최고 점수 localStorage 반영
- TC-P006: New Target 액션 정상 동작

## Execution Notes
- 정적 체크는 CLI 스크립트로 자동화
- 브라우저 런타임 체크는 JS 문법 검증 + 주요 상태 전이 수동 검증으로 대체
