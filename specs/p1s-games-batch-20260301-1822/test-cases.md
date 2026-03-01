# Test Cases — P1S Batch (3 Games)

## Global Preconditions
- Modern browser with Canvas/Web Audio/localStorage support.
- Test on desktop keyboard and mobile touch layout.

---

## A. Orbital Triage Command
- TC-OTC-001: 초기 로드 시 HUD(score/wave/integrity/module status)가 렌더링된다.
- TC-OTC-002: 키보드 `1~4`로 모듈 선택이 동작한다.
- TC-OTC-003: 키보드 `Q/W/E` 액션 선택 + `Space` 실행이 동작한다.
- TC-OTC-004: 터치 모듈/액션/실행 버튼이 동일 기능 수행한다.
- TC-OTC-005: 액션 성공 시 모듈 손상도 감소 및 점수 증가가 반영된다.
- TC-OTC-006: 임계치 모듈 발생 시 경고 상태 + SFX가 재생된다.
- TC-OTC-007: 게임오버 후 재시작 가능, 최고 기록 localStorage 유지된다.
- TC-OTC-008: 390x844에서 가로 스크롤 없이 조작 가능하다.

## B. Frostbite Freight Fix
- TC-FFF-001: 초기 로드 시 격자/목표 도크/이동수 HUD가 출력된다.
- TC-FFF-002: `Arrow/WASD` 입력 시 드론이 얼음 규칙대로 미끄러진다.
- TC-FFF-003: 터치 방향 버튼이 키보드와 동일하게 동작한다.
- TC-FFF-004: `R` 또는 터치 리셋으로 현재 스테이지 초기화가 된다.
- TC-FFF-005: 모든 화물을 도크에 배치하면 스테이지 클리어된다.
- TC-FFF-006: move cap 초과 시 fail 처리 후 재시작 가능하다.
- TC-FFF-007: 최고 클리어 스테이지/효율 점수가 localStorage에 저장된다.
- TC-FFF-008: 360x800에서 버튼 접근성과 가독성이 유지된다.

## C. Mythic Postal Panic
- TC-MPP-001: 초기 로드 시 컨베이어/HUD/룬 버튼이 표시된다.
- TC-MPP-002: `A/S/D/F` 입력으로 해당 룬 스탬프가 적용된다.
- TC-MPP-003: 터치 룬 버튼 4종이 동일 입력으로 작동한다.
- TC-MPP-004: 정답 입력 시 콤보 증가 + 히트 SFX가 재생된다.
- TC-MPP-005: 오답/미스 시 miss 카운트가 증가하고 페널티가 적용된다.
- TC-MPP-006: miss 5 도달 시 게임오버 + 재시작 루프가 동작한다.
- TC-MPP-007: 최고 점수/콤보가 localStorage에 저장되고 새로고침 후 복구된다.
- TC-MPP-008: 390x844에서 UI가 겹치지 않고 플레이 가능하다.

---

## Integration / Repo
- TC-INT-001: 신규 슬러그 3개가 기존 `games/*`와 중복되지 않는다.
- TC-INT-002: 각 신규 폴더에 `index.html` + `manifest.webmanifest`가 존재한다.
- TC-INT-003: 각 신규 `index.html` 파일 크기가 500KB 미만이다.
- TC-INT-004: `games/manifest.json` 최상단에 신규 3개가 prepend 순서로 반영된다.
- TC-INT-005: `games/manifest.json` `count=137`, `updatedAt` 최신값으로 갱신된다.
- TC-INT-006: `git status`가 의도된 변경만 포함한다.
