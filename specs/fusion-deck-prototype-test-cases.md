# Test Cases — fusion-deck-prototype

## Functional
- TC-F001: 타이틀 화면에서 New Run / Resume 버튼이 노출된다.
- TC-F002: New Run 시작 시 1층 전투 + 3장 선택 UI가 표시된다.
- TC-F003: 전투에서 카드 1장 선택 시 즉시 효과가 적용되고 적 Intent 해소(적 턴)가 진행된다.
- TC-F004: 적 처치 시 보상 카드 3장 중 1장 선택 후 다음 층으로 이동한다.
- TC-F005: 5층 클리어 시 Victory 화면으로 전환된다.
- TC-F006: 플레이어 HP 0 이하 시 Game Over 화면으로 전환된다.

## Fusion
- TC-F101: 전투/보상 화면에서 Fusion 버튼(또는 F 키)로 Fusion 모드 진입 가능.
- TC-F102: Fusion 모드에서 카드 2장 선택 시 유효 레시피면 상위 카드로 교체된다.
- TC-F103: 레시피 불일치 시 덱 변경 없이 실패 메시지가 표시된다.
- TC-F104: 동일 카드 2장 융합 시 덱 내 수량 체크가 적용된다.

## Input
- TC-I001: 터치/클릭으로 카드 선택 가능.
- TC-I002: 키보드 1/2/3 으로 카드 선택 가능(전투/보상).
- TC-I003: 키보드 F로 Fusion 토글, ESC로 Fusion 닫기 가능.

## Audio
- TC-A001: 카드 드로우 시 효과음 재생.
- TC-A002: 공격 계열 카드 사용 시 효과음 재생.
- TC-A003: 융합 성공 시 효과음 재생.

## Persistence
- TC-D001: 전투/보상 중 상태 변화 후 localStorage 진행도 저장.
- TC-D002: 최고 층/최고 점수가 localStorage에 누적 저장.
- TC-D003: 새로고침 후 Resume으로 저장된 런 재개 가능.

## UI/Quality
- TC-U001: 모바일 390x844 기준 세로 레이아웃에서 UI 요소가 잘리지 않는다.
- TC-U002: 배경 테마 색상 `#0a0a1a` 기반 네온 대비가 유지된다.
- TC-U003: 단일 HTML 파일 크기 500KB 미만.
- TC-Q001: JS 구문 에러 없음 (`node` 스크립트 파싱 통과).
- TC-Q002: HTML 구조 파싱 오류 없음(표준 파서 기준).
