# Test Cases — Lantern Longball League

## Functional
- TC-F001: 390x844 뷰포트에서 타이틀, 시작 버튼, HUD, 캔버스, `HOOK L`, `HOOK R`, 재시작 버튼이 화면 안에 렌더링된다.
- TC-F002: 시작 버튼 탭 시 플레이 상태로 진입하고 첫 투구가 시작된다.
- TC-F003: 공이 스트라이크 창에 들어왔을 때 위쪽 스와이프로 타격하면 타구가 발사된다.
- TC-F004: 타구 비행 중 `HOOK L / HOOK R` 입력 시 공의 곡률이 좌우로 변한다.
- TC-F005: 랜턴 링 통과 시 점수와 배너가 갱신된다.
- TC-F006: 미스 또는 낙구 시 아웃이 증가하고 3아웃이면 결과 화면이 열린다.
- TC-F007: 결과 화면의 `다시 시작` 버튼 탭 시 새 런으로 초기화된다.

## Core mechanic
- TC-C001: 스와이프 각도와 길이에 따라 타구 속도/방향이 달라진다.
- TC-C002: 훅 게이지가 남아 있을 때만 공중 곡률 조작이 적용된다.
- TC-C003: 잭팟 링을 통과한 홈런은 일반 홈런보다 큰 점수와 불꽃 연출을 낸다.

## Wow factors
- TC-W001: Arc Swipe Bat가 스윙 고스트와 함께 보이고 타구 발사에 직접 반영된다.
- TC-W002: Sky Curve Hooks 사용 시 잔상과 함께 탄도가 꺾인다.
- TC-W003: 2회 성공 타구 후 Dugout Draft 3지선다 오버레이가 열린다.
- TC-W004: 잭팟 홈런 시 Firework Homer Freeze 배너와 파티클이 뜬다.
- TC-W005: 결과 화면에 Pennant Contract 달성 수와 Share Card 문구가 표시된다.

## Persistence / quality
- TC-Q001: 최고 점수·최고 홈런·최고 칭호·런 수가 `localStorage`에 저장된다.
- TC-Q002: 390x844 기준 `scrollWidth <= innerWidth`를 만족해 가로 오버플로가 없다.
- TC-Q003: `?autotest=1` 실행 시 start/hit/hook/draft/homer/save/restart 스모크 검증이 PASS 된다.
- TC-Q004: 브라우저 `pageerror`가 0개다.

## Launch verification
- TC-L001: 로컬 HTTP에서 `games/lantern-longball-league/`가 200으로 열린다.
- TC-L002: 라이브 URL `https://eastsea-blog.pages.dev/games/lantern-longball-league/`가 열리고 타이틀 텍스트가 노출된다.
