# Test Cases — p1-games-batch-20260302-1235

## 공통 기능
- TC-F001: 타이틀/게임 HUD가 정상 렌더링된다.
- TC-F002: 시작 후 즉시 플레이 가능하며 점수 또는 진행 지표가 변한다.
- TC-F003: 게임오버/리셋/재시작 루프가 동작한다.

## 입력
- TC-I001: 키보드 입력이 모든 핵심 조작에 반응한다.
- TC-I002: 터치 버튼/제스처가 동일 기능으로 동작한다.

## 기술 요구사항
- TC-T001: Web Audio API(`AudioContext`) 기반 효과음 호출이 있다.
- TC-T002: localStorage에 최고점/진행 데이터가 저장 및 복원된다.
- TC-T003: 배경/테마에 `#0a0a1a` 기반 네온 다크가 적용된다.
- TC-T004: 각 게임은 단일 `index.html` 파일이며 외부 JS/CSS 의존이 없다.
- TC-T005: 각 `index.html` 크기가 500KB 미만이다.

## 반응형/안정성
- TC-U001: 390x844 모바일 뷰에서 UI 오버플로 없이 플레이 가능하다.
- TC-Q001: 브라우저 로드 시 JS 에러(`pageerror`/console error)가 없다.

## 카탈로그
- TC-C001: `games/manifest.json` 상단 3개에 신규 slug가 prepend 된다.
- TC-C002: `games/manifest.json`의 `count`는 `games.length`와 일치한다.
- TC-C003: `games/games-list.json` 상단 3개에 신규 id가 prepend 된다.
