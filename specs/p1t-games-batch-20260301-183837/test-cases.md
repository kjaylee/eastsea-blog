# Test Cases — P1T Batch (3 Games)

## Global Preconditions
- Modern browser with Canvas/Web Audio/localStorage support.
- Test on desktop keyboard and mobile touch layout.

---

## A. Ferrofluid Sculptor Lab
- TC-FSL-001: 초기 로드 시 5x5 격자/HUD/목표 패턴 정보가 렌더링된다.
- TC-FSL-002: `Arrow/WASD` 커서 이동이 정상 동작한다.
- TC-FSL-003: `Space/Enter` 또는 셀 탭으로 강도 순환(0~3)이 된다.
- TC-FSL-004: `R` 또는 터치 리셋 버튼으로 현재 스테이지가 초기화된다.
- TC-FSL-005: 목표 패턴 달성 시 stage/score가 증가하고 다음 라운드로 진행된다.
- TC-FSL-006: move budget 소진 시 fail 처리 후 재시도 가능하다.
- TC-FSL-007: 최고 stage/score가 localStorage에 저장되고 복구된다.
- TC-FSL-008: 390x844에서 가로 스크롤 없이 플레이 가능하다.

## B. Cathedral Bell Conductor
- TC-CBC-001: 초기 로드 시 4레인/스코어/콤보/미스 HUD가 표시된다.
- TC-CBC-002: `A/S/D/F`로 각 레인 타격이 동작한다.
- TC-CBC-003: 터치 벨 버튼 4종이 동일 입력으로 작동한다.
- TC-CBC-004: 판정 구간 타격 시 점수/콤보 상승 + 벨 SFX가 재생된다.
- TC-CBC-005: 미스 시 miss 카운트 증가 + 콤보 리셋이 반영된다.
- TC-CBC-006: miss 8 또는 타임아웃 시 게임오버 + 재시작 루프가 동작한다.
- TC-CBC-007: 최고 점수/콤보가 localStorage에 저장·복구된다.
- TC-CBC-008: 360x800에서 버튼 배치가 겹치지 않는다.

## C. Moth Lantern Ascent
- TC-MLA-001: 초기 로드 시 플레이 영역/HUD/터치 패드가 표시된다.
- TC-MLA-002: 좌우 키 입력으로 나방 이동, Space로 부스트가 동작한다.
- TC-MLA-003: 터치 좌/우/부스트 버튼이 동일 기능 수행한다.
- TC-MLA-004: 랜턴 에너지 수집 시 점수 증가 + 수집 SFX가 재생된다.
- TC-MLA-005: 장애물 충돌 시 내구 감소 + 히트 피드백이 발생한다.
- TC-MLA-006: 에너지 0 또는 내구 0 시 게임오버 후 재시작 가능하다.
- TC-MLA-007: 최고 거리/점수가 localStorage에 저장·복구된다.
- TC-MLA-008: 390x844에서 플레이/컨트롤 접근성이 유지된다.

---

## Integration / Repo
- TC-INT-001: 신규 슬러그 3개가 기존 `games/*`와 중복되지 않는다.
- TC-INT-002: 각 신규 폴더에 `index.html` + `manifest.webmanifest`가 존재한다.
- TC-INT-003: 각 신규 `index.html` 파일 크기가 500KB 미만이다.
- TC-INT-004: `games/manifest.json` 최상단에 신규 3개가 prepend 순서로 반영된다.
- TC-INT-005: `games/manifest.json` `count=140`, `updatedAt` 최신값으로 갱신된다.
- TC-INT-006: `git status`가 의도된 변경만 포함한다.
