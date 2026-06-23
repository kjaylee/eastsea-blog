# Test Cases — signal-tea-house

## Functional
- TC-F001: 타이틀 정보와 시작 버튼이 390x844 한 화면 안에서 렌더링된다.
- TC-F002: 시작 버튼 탭 후 플레이 상태로 진입하고 `서빙` 버튼이 활성화된다.
- TC-F003: 보드 타일 탭 시 `위로 → 직진 → 아래로` 순환이 즉시 시각 반영된다.
- TC-F004: 온도 버튼 탭 시 `냉차 / 미지근 / 뜨거움` 상태가 바뀐다.
- TC-F005: 올바른 행과 온도를 맞춰 서빙하면 점수와 콤보가 증가한다.
- TC-F006: 행 또는 온도가 틀리면 생명이 감소하고 로그에 실패 사유가 남는다.
- TC-F007: 생명 0이 되면 게임오버 결산 카드가 열린다.
- TC-F008: 재시작 버튼 탭 시 새 런으로 초기화된다.

## Wow factor
- TC-W001: Forecast Tray에 현재 주문 포함 3개 주문 카드와 오멘 문구가 표시된다.
- TC-W002: 3연속 성공 시 Aroma Bloom 배너와 배율 보너스가 발동한다.
- TC-W003: 4턴마다 Tea House Decree 3지선다 오버레이가 열린다.
- TC-W004: Daily Guest Seal 진행도가 완벽한 다과 성공에 따라 증가하고 저장된다.
- TC-W005: Ledger Share Card에 점수·최대 콤보·칭호·선택 칙령이 표시되고 복사 버튼이 동작한다.

## Platform / storage
- TC-P001: 390x844 viewport에서 가로 스크롤이 없다.
- TC-P002: `localStorage`에 최고 점수, 최고 콤보, 런 횟수, 일일 과업 상태가 저장된다.
- TC-P003: `?autotest=1` 진입 시 자동 검증 텍스트가 PASS를 출력한다.
- TC-P004: JS `pageerror` 가 0개다.
