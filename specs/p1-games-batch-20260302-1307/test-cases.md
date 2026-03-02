# Test Cases — p1-games-batch-20260302-1307

## 공통 기능 (필수)
- TC-F001: 타이틀 화면에서 게임명/시작 버튼이 보인다.
- TC-F002: 시작 입력(클릭/터치) 후 play 상태로 진입한다.
- TC-F003: 핵심 입력이 즉시 반영된다.
- TC-F004: 보조 시스템(레벨/루프/웨이브/업그레이드)이 동작한다.
- TC-F005: 게임 오버 조건 진입 시 gameover 화면이 표시된다.
- TC-F006: 재시작 후 play 루프가 정상 재개된다.
- TC-F007: localStorage 저장/로드가 동작한다.

## i18n
- TC-I001: 기본 한국어 텍스트가 렌더링된다.
- TC-I002: 언어 토글 시 영어 텍스트로 바뀐다.

## 모바일/입력
- TC-U001: 390x844 뷰포트에서 UI 오버플로 없이 플레이 가능하다.
- TC-U002: 터치 입력으로 키보드와 동일 기능 수행 가능하다.
- TC-U003: viewport-fit=cover + safe-area padding이 적용된다.

## 성능/안정성
- TC-P001: 페이지 로드 5초 이내.
- TC-P002: JS pageerror 0건.
- TC-P003: Canvas가 빈 화면이 아니고 객체가 렌더링된다.

## 정책 준수
- TC-R001: 리듬게임 메커닉 없음.
- TC-R002: `#0a0a1a` 미사용.
- TC-R003: slug/name에 `neon-` 미사용.
- TC-R004: 단순 클릭+웨이브/방치/카드 조합 아님.

## 게임별 고유 메카닉

### paper-gate-arbiter
- TC-G1-001: Inspect 토큰이 유한 자원으로 소모된다.
- TC-G1-002: 규정 세트가 라운드 진행에 따라 변하고 판정 결과가 달라진다.
- TC-G1-003: Approve/Deny 외 Inspect가 전략적 대안으로 점수 기대값 차이를 만든다.

### echo-loop-speedway
- TC-G2-001: 1루프 종료 시 이전 입력 기록이 ghost로 재생된다.
- TC-G2-002: sync gate는 player+ghost 동시 레인 일치 시 통과한다.
- TC-G2-003: ghost 부재(첫 루프) 상태에서 sync gate 충돌 처리된다.

### inkfield-bastion
- TC-G3-001: 타일 페인팅으로 지형 속성(전류/수지)이 바뀐다.
- TC-G3-002: 전류 타일에서만 포탑 사격이 활성화된다.
- TC-G3-003: 수지 타일에서 적 이동이 감속된다.

## 카탈로그
- TC-C001: `games/manifest.json` 최상단에 신규 3개 slug prepend.
- TC-C002: `games/manifest.json`의 `count === games.length`.
- TC-C003: `games/games-list.json` 최상단에 신규 3개 id prepend.
