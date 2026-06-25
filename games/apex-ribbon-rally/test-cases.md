# Test Cases — apex-ribbon-rally

## Functional
- TC-F001: 타이틀 화면과 시작 버튼이 390x844에서 한 화면 내 렌더링된다.
- TC-F002: `Start Rally` 탭 시 플레이 상태로 진입한다.
- TC-F003: 시작 지점에서 드로우한 리본이 차량 경로 판정에 반영된다.
- TC-F004: 성공 시 점수와 콤보가 증가한다.
- TC-F005: 실패 시 Grip이 감소한다.
- TC-F006: 3섹터 후 `Pit Board Draft` 3지선다 패널이 열린다.
- TC-F007: Draft 선택 후 플레이 상태로 복귀한다.
- TC-F008: Grip 0 또는 6섹터 종료 시 결과 패널이 열린다.
- TC-F009: `Retry` 탭 시 새 런으로 초기화된다.

## Wow factor
- TC-W001: Forecast Ribbon에 현재 포함 다음 3개 섹터 정보가 보인다.
- TC-W002: Apex Echo 퍼센트와 유령 라인이 성공 후 갱신된다.
- TC-W003: 3콤보 이상에서 Crowd Flash 배너가 뜬다.
- TC-W004: Finish Postcard가 결과 카드에 표시된다.
- TC-W005: Copy Card가 오류 없이 호출된다.

## Persistence and safety
- TC-S001: 결과 이후 `localStorage`에 최고 점수/콤보/일일 메달이 저장된다.
- TC-S002: `window` pageerror가 0건이다.
- TC-S003: 390x844 기준 가로 overflow가 없다.

## Autotest target
- title
- start
- forecast ribbon
- core mechanic success
- pit board open/apply
- crowd flash
- apex echo
- gameover/result
- localStorage
- restart
- mobile width
- pageerror 0
