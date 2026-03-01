# Test Cases — p1-games-batch-20260301-214119

## 공통 기능
- **TC-F001**: 각 게임 첫 로드 시 타이틀/설명/UI가 정상 렌더링된다.
- **TC-F002**: Start 입력 후 게임 루프가 시작되고 점수/진행 지표가 변한다.
- **TC-F003**: 게임오버 또는 라운드 종료 뒤 Restart가 동작한다.

## 입력/반응형
- **TC-I001**: 키보드 입력(방향키/문자/숫자/스페이스/엔터)이 즉시 반응한다.
- **TC-I002**: 터치 입력(온스크린 버튼/패드 탭)이 동일 기능으로 동작한다.
- **TC-U001**: 390x844 모바일 뷰에서 UI가 겹치지 않고 플레이 가능하다.

## 기술 요구사항
- **TC-T001**: Web Audio API(`AudioContext`) 기반 효과음 호출이 존재한다.
- **TC-T002**: localStorage로 최고 기록 저장/복원이 된다.
- **TC-T003**: `#0a0a1a` 테마가 적용된다.
- **TC-T004**: 외부 JS/CSS 라이브러리 참조가 없다(단일 HTML).
- **TC-T005**: 각 `index.html` 파일 크기가 500KB 미만이다.
- **TC-T006**: 각 게임 폴더의 `manifest.webmanifest`가 유효 JSON이다.

## 배치 통합
- **TC-B001**: `games/manifest.json` 최상단 3개가 신규 slug 순서로 prepend 된다.
- **TC-B002**: `games/manifest.json`의 `count`가 170으로 갱신된다.
- **TC-B003**: `updatedAt`가 작업 시각 기준으로 갱신된다.
