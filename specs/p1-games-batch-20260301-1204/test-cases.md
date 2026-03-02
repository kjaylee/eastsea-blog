# Test Cases — p1-games-batch-20260301-1204

## Common Gate (All 3 Games)
- TC-C001: `index.html` 단일 파일 존재
- TC-C002: 파일 크기 `< 500KB`
- TC-C003: viewport + 모바일 반응형 CSS 존재
- TC-C004: 테마 색상 `#0a0a1a` 적용
- TC-C005: Web Audio API 경로 존재 (`AudioContext`)
- TC-C006: localStorage 저장/복구 로직 존재
- TC-C007: 키보드 입력 핸들러 존재 (`keydown`)
- TC-C008: 터치/포인터 입력 핸들러 존재 (`touchstart`/`pointerdown`)
- TC-C009: PWA manifest 링크 및 파일 존재
- TC-C010: JS 문법 `node --check` 통과

## Magnet Maze
- TC-M001: 극성 토글 동작(N/S 상태 변화)
- TC-M002: 방향 이동 동작(키보드+터치)
- TC-M003: 자석 상호작용(흡인/반발) 적용
- TC-M004: 출구 도달 시 레벨 증가
- TC-M005: 6개 레벨 순차 진행 가능
- TC-M006: 최고 레벨 localStorage 저장

## Waveform Rider
- TC-W001: 플레이어 Y 위치가 사인파로 갱신
- TC-W002: 진폭/주파수 입력(키+터치) 반영
- TC-W003: 장애물 충돌 시 게임오버
- TC-W004: 생존 시간 기반 점수 증가
- TC-W005: 난이도(속도/스폰율) 점진 상승
- TC-W006: 최고 점수 localStorage 저장
- TC-W007: 무한 모드 루프 유지

## Prism Split
- TC-P001: 프리즘 각도 조절 입력 반영
- TC-P002: 미러 각도 조절 입력 반영
- TC-P003: RGB 분광 레이 경로 렌더
- TC-P004: 반사각 계산 후 경로 변경
- TC-P005: 타겟 적중 판정 및 레벨 클리어
- TC-P006: 6개 레벨 순차 진행 가능
- TC-P007: 최고 레벨 localStorage 저장

## Execution Notes
- 체크리스트 검증은 Node 기반 정적 분석 + 파일 시스템 검증으로 수행
- JS 문법 검증은 HTML 내 `<script>` 블록 추출 후 `node --check`로 확인
