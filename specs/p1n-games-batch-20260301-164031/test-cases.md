# Test Cases — P1n Batch 20260301-164031

## Common Functional Cases (All 3 games)
- TC-F001: 타이틀/초기 오버레이가 정상 렌더링된다.
- TC-F002: Start 이후 플레이 상태로 전환된다.
- TC-F003: 터치(pointerdown) 입력으로 핵심 조작이 동작한다.
- TC-F004: 키보드 입력(방향키/숫자/Enter/Space 등)으로 동일 조작이 가능하다.
- TC-F005: 게임오버/클리어 후 재시작이 가능하다.

## Platform/Quality Cases (All 3 games)
- TC-U001: 390x844 모바일 뷰포트에서 UI가 깨지지 않는다.
- TC-U002: 배경 기본색이 #0a0a1a 네온 다크 계열이다.
- TC-P001: Web Audio API(AudioContext) 기반 효과음이 트리거된다.
- TC-P002: localStorage에 best score/progress가 저장되고 재로드 시 복원된다.
- TC-P003: 각 index.html 파일 크기가 500KB 미만이다.
- TC-P004: `manifest.webmanifest`가 존재하고 start_url/display/theme_color를 포함한다.
- TC-P005: 외부 CDN/라이브러리 의존 script/link가 없다.

## Batch Integration Cases
- TC-I001: `games/manifest.json` 배열 맨 앞 3개가 신규 slug 순서로 prepend 되었다.
- TC-I002: `count`가 119로 갱신되었다.
- TC-I003: `updatedAt`이 최신 UTC 타임스탬프로 갱신되었다.
- TC-I004: JSON 파싱 오류가 없다.

## Manual Scenario Notes
- Constellation Courier Zipline: 목표 색 전환 + 패킷 전달 정확도/콤보 확인
- Reef Ledger Keeper: 정책 선택에 따른 4개 지표 증감 및 실패 조건 확인
- Origami Rescue Grid: 타일 회전/실행으로 출구 도달 판정 및 스테이지 진행 저장 확인