# Test Cases — Set Arc Stadium

## Functional
- TC-F001: 390x844 뷰포트에서 타이틀, 시작 버튼, 캔버스, 상단 HUD, 하단 계약 카드가 화면 내 렌더링된다.
- TC-F002: 시작 버튼 탭 시 플레이 상태로 진입하고 세터 위치와 블로커, 스포트라이트 존이 표시된다.
- TC-F003: 세터 존에서 드래그 시 세트 아크 프리뷰가 보이고 손을 떼면 공이 발사된다.
- TC-F004: 공이 블로커를 피하고 상대 코트에 착지하면 점수와 랠리가 증가한다.
- TC-F005: 공이 블로커에 막히거나 코트 밖으로 나가면 라이프가 감소한다.
- TC-F006: 라이프가 0이 되면 결과 화면이 열리고 Highlight Card 텍스트가 생성된다.
- TC-F007: 결과 화면의 `다시 랠리` 버튼 탭 시 새 게임으로 초기화된다.

## Core mechanic
- TC-C001: 드래그의 좌우 방향이 공격 레인(left/center/right)을 결정한다.
- TC-C002: 드래그 높이가 템포(quick/mid/high) 판정에 반영된다.
- TC-C003: 네트 상단의 블로커 위치와 충돌 여부가 성공/실패 판정에 반영된다.

## Wow factors
- TC-W001: Set Arc Input 프리뷰 곡선이 보이며 release 후 실제 궤적이 그 라인을 따라간다.
- TC-W002: 랠리 진행에 따라 Shift Block Escalation이 발동해 블로커 속도 또는 폭이 증가한다.
- TC-W003: 3득점 도달 시 Playbook Draft 3지선다 오버레이가 열린다.
- TC-W004: perfect cross-court 또는 spotlight hit 시 Broadcast Freeze 배너와 슬로모션이 발동한다.
- TC-W005: 계약 카드 3종의 달성 상태가 실시간으로 갱신된다.

## Persistence / quality
- TC-Q001: 최고 점수·최고 랠리·최고 칭호가 `localStorage`에 저장된다.
- TC-Q002: 390x844 기준 `scrollWidth <= innerWidth`를 만족해 가로 오버플로가 없다.
- TC-Q003: `?autotest=1` 실행 시 start/shot/score/draft/save/restart 스모크 검증이 PASS 된다.
- TC-Q004: 브라우저 `pageerror`가 0개다.

## Launch verification
- TC-L001: 로컬 HTTP에서 `games/set-arc-stadium/`가 200으로 열린다.
- TC-L002: 라이브 URL `https://eastsea-blog.pages.dev/games/set-arc-stadium/`가 열리고 타이틀 텍스트가 노출된다.
