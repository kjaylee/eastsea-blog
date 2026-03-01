# Test Cases — P1R Batch (3 Games)

## Global Preconditions
- Modern browser with Canvas/Web Audio/localStorage support.
- Test on desktop keyboard and mobile touch layout.

---

## A. Chrono Loom Defender
- TC-CLD-001: 초기 로드 시 HUD(Score/Round/Stability/Energy)와 레인 UI가 렌더링된다.
- TC-CLD-002: 키보드 `1~4`로 레인 선택이 동작한다.
- TC-CLD-003: 키보드 `Q/W/E`로 위젯 선택, `Space` 배치가 동작한다.
- TC-CLD-004: 터치 레인/위젯/배치 버튼이 동일 기능 수행한다.
- TC-CLD-005: 배치 성공 시 anomaly HP 감소 및 점수 증가가 반영된다.
- TC-CLD-006: anomaly 누수 시 stability 감소 및 경고 SFX 재생된다.
- TC-CLD-007: 게임오버 후 재시작 가능, 최고 기록 localStorage 유지된다.
- TC-CLD-008: 390x844에서 가로 스크롤 없이 조작 가능하다.

## B. Quantum Koi Courier
- TC-QKC-001: 초기 로드 시 플레이필드/HUD/온스크린 버튼이 표시된다.
- TC-QKC-002: 키보드 `←/→`(또는 A/D)로 좌우 이동이 된다.
- TC-QKC-003: `Space` 대시가 발동되고 쿨다운이 적용된다.
- TC-QKC-004: 터치 좌/우/대시가 키보드와 동일하게 동작한다.
- TC-QKC-005: 진주 수집 시 점수와 콤보가 상승한다.
- TC-QKC-006: 소용돌이 충돌 시 HP 감소, 0이면 게임오버 된다.
- TC-QKC-007: 최고 거리/콤보가 localStorage에 저장되고 새로고침 후 복구된다.
- TC-QKC-008: 360x800에서 버튼 접근성과 가독성이 유지된다.

## C. Vault Echo Cartographer
- TC-VEC-001: 초기 로드 시 격자/라운드/실수 카운터 UI가 출력된다.
- TC-VEC-002: 시퀀스 재생 버튼(또는 R)으로 에코 경로 음/시각 힌트가 재생된다.
- TC-VEC-003: 화살표 + Enter로 입력 경로 확정이 가능하다.
- TC-VEC-004: 터치 격자 탭 + 확정 버튼으로 동일 입력이 가능하다.
- TC-VEC-005: 정답 입력 시 다음 단계로 진행하며 길이가 증가한다.
- TC-VEC-006: 오답 시 실수 카운트 감소, 에러 SFX가 재생된다.
- TC-VEC-007: 3회 오답 시 게임오버 및 재시작 동작이 정상이다.
- TC-VEC-008: 최고 단계/점수가 localStorage에 유지된다.

---

## Integration / Repo
- TC-INT-001: 신규 슬러그 3개가 기존 `games/*`와 중복되지 않는다.
- TC-INT-002: 각 신규 폴더에 `index.html` + `manifest.webmanifest`가 존재한다.
- TC-INT-003: 각 신규 `index.html` 파일 크기가 500KB 미만이다.
- TC-INT-004: `games/manifest.json` 최상단에 신규 3개가 prepend 순서로 반영된다.
- TC-INT-005: `games/manifest.json` `count=134`, `updatedAt` 최신값으로 갱신된다.
- TC-INT-006: `git status`가 의도된 변경만 포함한다.
