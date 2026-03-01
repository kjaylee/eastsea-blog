# Test Cases — p1-games-batch-20260302-0016

## A) Shared Compliance
- **TC-C001** 각 게임은 단일 `index.html`로 동작한다.
- **TC-C002** 각 `index.html` 파일 크기는 `< 500KB`이다.
- **TC-C003** CSS에 `#0a0a1a` 배경색 기반 네온 다크 테마가 존재한다.
- **TC-C004** 모바일(390x844)에서 HUD/버튼 오버플로우 없이 표시된다.
- **TC-C005** 터치 입력으로 핵심 액션 수행이 가능하다.
- **TC-C006** 키보드 입력으로 동일 핵심 액션 수행이 가능하다.
- **TC-C007** 최초 사용자 입력 후 Web Audio API 사운드가 재생된다.
- **TC-C008** 최고 기록이 localStorage 저장/로드된다.
- **TC-C009** `manifest.webmanifest` 파일이 존재하고 HTML에서 연결된다.

## B) tidal-choir-router
- **TC-T001** 최소 7라운드가 존재한다.
- **TC-T002** 셀 탭(터치)과 Space(키보드)로 타일 회전이 된다.
- **TC-T003** Enter/버튼으로 Pulse 시뮬레이션이 실행된다.
- **TC-T004** 모든 타워가 연결되면 라운드 클리어 처리된다.
- **TC-T005** 최고 라운드가 localStorage에 저장된다.

## C) ferro-reef-ballast
- **TC-F001** 좌/우 밸러스트 홀드 입력(터치+키보드)이 선체 기울기에 반영된다.
- **TC-F002** 암초 충돌/기울기 과다 시 내구도가 감소한다.
- **TC-F003** Surface Burst 입력이 즉시 회피 보정에 기여한다.
- **TC-F004** 게임 오버 후 재시작이 동작한다.
- **TC-F005** 최고 거리 기록이 localStorage에 저장된다.

## D) zenith-ziplane-rescue
- **TC-Z001** 상승/하강/부스트 입력(터치+키보드)이 이동에 반영된다.
- **TC-Z002** 조난자 근접 후 탑승/하차 동작이 수행된다.
- **TC-Z003** 바람/장애물 회피 로직이 동작한다.
- **TC-Z004** 연료 고갈 또는 충돌 시 게임 오버가 된다.
- **TC-Z005** 최고 구조 수가 localStorage에 저장된다.

## E) Manifest Sync
- **TC-M001** `games/manifest.json`에 신규 3개 slug가 맨 앞에 prepend 된다.
- **TC-M002** `count` 값이 197로 갱신된다.
- **TC-M003** `count === games.length`를 만족한다.
- **TC-M004** `updatedAt`가 최신 UTC 타임스탬프로 갱신된다.
