# Test Cases — Moonbell Madrigal

## Functional
- TC-F001: 390x844 뷰포트에서 타이틀, 시작 버튼, 보드, `Ring the Bell`, 재시작 버튼이 화면 내 렌더링된다.
- TC-F002: 시작 버튼 탭 시 플레이 상태로 진입하고 현재 종음과 예보 큐가 표시된다.
- TC-F003: 보드 타일 탭 시 타일이 90도 회전하고 시각 반영이 즉시 보인다.
- TC-F004: `Ring the Bell` 탭 시 종음이 경로를 따라 이동하고 성공/실패가 판정된다.
- TC-F005: 성공 시 점수와 콤보가 증가한다.
- TC-F006: 실패 시 스파크가 감소하고 0이 되면 게임오버 패널이 열린다.
- TC-F007: 결과 패널의 `다시 합주` 버튼 탭 시 새 게임으로 초기화된다.

## Core mechanic
- TC-C001: 중앙 좌측 발진 종루에서 출발한 종음은 연결된 거울 방향으로만 이동한다.
- TC-C002: 우측 바깥으로 빠져나간 행의 종루 색이 현재 종음과 일치할 때만 성공 처리된다.
- TC-C003: 루프/막힘/잘못된 출구는 실패 처리된다.

## Wow factors
- TC-W001: Lunar Forecast Ribbon에 현재 오멘 설명과 다음 3개 예보 카드가 보인다.
- TC-W002: 3연속 성공 시 Moon Chorus 배너가 뜨고 추가 점수가 반영된다.
- TC-W003: 4턴째 종료 후 Midnight Decree 3지선다 오버레이가 열린다.
- TC-W004: 성공 누적 시 별자리가 점등되고 칭호가 상향된다.
- TC-W005: 게임오버 시 Chronicle Share Card 텍스트가 생성된다.

## Persistence / quality
- TC-Q001: 최고 점수·최고 콤보·칭호가 `localStorage`에 저장된다.
- TC-Q002: 390x844 기준 `scrollWidth <= innerWidth`를 만족해 가로 오버플로가 없다.
- TC-Q003: `?autotest=1` 실행 시 start/rotate/route/chorus/decree/save/restart 스모크 검증이 PASS 된다.
- TC-Q004: 브라우저 `pageerror`가 0개다.

## Launch verification
- TC-L001: 로컬 HTTP에서 `games/moonbell-madrigal/`가 200으로 열린다.
- TC-L002: 라이브 URL `https://eastsea-blog.pages.dev/games/moonbell-madrigal/`가 열리고 타이틀 텍스트가 노출된다.
