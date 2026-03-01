# Test Cases — P1 Games Batch 20260301-233351

## Common (all 3 games)
- TC-C001: 페이지 로드 시 타이틀/HUD/게임 영역 렌더링
- TC-C002: 390x844 모바일 뷰에서 레이아웃 깨짐 없음
- TC-C003: 키보드 입력 동작 (`keydown` 기반)
- TC-C004: 터치/포인터 입력 동작 (`pointerdown`/`touch` 계열)
- TC-C005: Web Audio API로 효과음 재생 함수 존재 및 호출
- TC-C006: localStorage 최고 기록 로드/저장
- TC-C007: 배경/테마 색상 `#0a0a1a` 계열 적용
- TC-C008: index.html 파일 크기 < 500KB
- TC-C009: `manifest.webmanifest` 존재 및 `start_url/display/theme_color` 유효

## Game-specific

### Neon Kite Telegraph
- TC-NKT-001: 좌우 이동 + Dash 입력으로 장애물 회피 가능
- TC-NKT-002: 비콘 수집 시 점수/콤보 증가
- TC-NKT-003: 충돌 시 내구도 감소, 0에서 게임 종료 및 최고점 저장

### Quantum Kimchi Courier
- TC-QKC-001: 3개 구역 상태가 시간에 따라 변동
- TC-QKC-002: 액션(Boost/Cool/Ship) 적용 시 지표 변화 및 점수 반영
- TC-QKC-003: 신뢰도 0 또는 spoilage 임계 초과 시 종료 처리

### Tidal Signal Cartographer
- TC-TSC-001: 5x5 그리드 타일 선택/키보드 이동으로 경로 생성
- TC-TSC-002: 목표 노드 도달 시 라운드 상승
- TC-TSC-003: 오입력/턴 소진 시 실패 처리 및 기록 저장

## Manifest
- TC-M001: `games/manifest.json` 신규 3개 엔트리가 배열 선두 3칸에 위치
- TC-M002: `count` 값 188
- TC-M003: `updatedAt`가 최신 UTC ISO 문자열
