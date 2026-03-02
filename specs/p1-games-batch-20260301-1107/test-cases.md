# Test Cases — games batch (gravity-dash / hex-empire / chain-reaction)

## Functional
- TC-F001: 각 게임 타이틀/초기 화면 정상 렌더링.
- TC-F002: 시작 입력 후 플레이 상태 전환.
- TC-F003: 핵심 입력 동작 확인
  - Gravity Dash: 중력 반전, Pulse 발동
  - Hex Empire: 타일 선택/점령, 턴 진행
  - Chain Reaction: 위치 선택 후 연쇄 폭발 발생
- TC-F004: 실패/결과 화면 후 재시작 동작.

## Input & Platform
- TC-I001: 터치/포인터 입력 정상 동작.
- TC-I002: 키보드 입력 정상 동작(keydown 핸들러 존재 + 액션 매핑).
- TC-I003: 모바일 레이아웃(390x844 기준) 오버플로우 없이 플레이 가능.

## Persistence / Audio / PWA
- TC-D001: localStorage read/write 키 존재.
- TC-A001: Web Audio 경로 존재(SoundManager 또는 AudioContext).
- TC-PWA001: rel="manifest" 링크 존재(/games/manifest.json).

## Build Safety
- TC-B001: 단일 HTML 파일 크기 < 500KB.
- TC-B002: 인라인 스크립트 문법 검사(node --check) 통과.
