# Test Cases — 20260301-223814

## 공통 기능
- **TC-F001**: 각 게임 첫 로드 시 타이틀/HUD/조작 안내가 렌더링된다.
- **TC-F002**: Start 입력 후 게임 루프가 시작되고 점수/진행 지표가 갱신된다.
- **TC-F003**: Game Over 또는 라운드 종료 후 Restart로 정상 재시작된다.

## 입력/플랫폼
- **TC-I001**: 키보드 입력(방향키, A/D, 숫자키, Space/Enter 등)이 반응한다.
- **TC-I002**: 터치 버튼 입력이 동일 기능으로 동작한다.
- **TC-U001**: 모바일 뷰(390x844)에서 UI 겹침 없이 플레이 가능하다.

## 기술 요구사항
- **TC-T001**: Web Audio API(`AudioContext`) 기반 효과음 호출이 존재한다.
- **TC-T002**: localStorage로 최고 기록을 저장/복원한다.
- **TC-T003**: 배경/테마 컬러 `#0a0a1a` 사용이 확인된다.
- **TC-T004**: 외부 JS/CSS 의존성 없이 단일 HTML이다.
- **TC-T005**: 각 `index.html` 파일 크기 500KB 미만이다.
- **TC-T006**: 각 게임 `manifest.webmanifest`가 유효 JSON으로 존재한다.

## 배치 통합
- **TC-B001**: `games/manifest.json` 최상단 3개가 신규 slug 순서로 prepend 된다.
- **TC-B002**: `games/manifest.json` `count`가 179로 갱신된다.
- **TC-B003**: `updatedAt`가 현재 시각으로 갱신된다.
