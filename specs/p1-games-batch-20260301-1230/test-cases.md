# Test Cases — p1-games-batch-20260301-1230

## A) Shared Compliance
- **TC-C001** 단일 `index.html` 구조여야 한다.
- **TC-C002** 각 `index.html` 파일 크기 `< 500KB`여야 한다.
- **TC-C003** 네온 다크 테마(`#0a0a1a`)가 포함되어야 한다.
- **TC-C004** 모바일(390x844) 레이아웃에서 HUD/컨트롤 오버플로우가 없어야 한다.
- **TC-C005** 터치 입력으로 핵심 액션이 수행되어야 한다.
- **TC-C006** 키보드 입력으로 동일 핵심 액션이 수행되어야 한다.
- **TC-C007** 사용자 입력 후 Web Audio API 사운드가 재생되어야 한다.
- **TC-C008** localStorage 최고 기록 저장/로드가 동작해야 한다.
- **TC-C009** `manifest.webmanifest` 파일 존재 및 HTML link 연결.
- **TC-C010** 인라인 JS 추출 후 `node --check` 통과.

## B) quantum-bounce
- **TC-Q001** 8레벨 이상 구성되어야 한다.
- **TC-Q002** 발사 조준(드래그/키보드) 후 Launch가 가능해야 한다.
- **TC-Q003** Observe(홀드) 중에만 벽/장애물 반사가 일어나야 한다.
- **TC-Q004** Observe 상태로 타겟 적중 시 레벨 클리어 처리되어야 한다.
- **TC-Q005** 최고 해금 레벨 localStorage 저장.

## C) ink-flow
- **TC-I001** 6레벨 이상 구성되어야 한다.
- **TC-I002** 터치 드래그로 인접 셀 경로가 생성되어야 한다.
- **TC-I003** 키보드(화살표)로 경로 확장 및 Backspace undo가 되어야 한다.
- **TC-I004** Enter/Run 실행 시 잉크가 경로를 따라 진행되어야 한다.
- **TC-I005** 목표 도달 + 필수 게이트 통과 시 클리어.
- **TC-I006** 최고 해금 레벨 localStorage 저장.

## D) gear-train
- **TC-G001** 6레벨 이상 구성되어야 한다.
- **TC-G002** 셀 탭/스페이스로 기어(8/12/16) 순환 배치 가능해야 한다.
- **TC-G003** 입력 기어에서 연결된 기어망의 방향/속도 계산이 수행되어야 한다.
- **TC-G004** 출력 기어가 target 방향+RPM 조건 만족 시 클리어되어야 한다.
- **TC-G005** 키보드 커서 이동 및 배치 입력이 가능해야 한다.
- **TC-G006** 최고 해금 레벨 localStorage 저장.

## E) Manifest Sync
- **TC-M001** `games/manifest.json`에 신규 slug 3개(`quantum-bounce`,`ink-flow`,`gear-train`) 추가.
- **TC-M002** `count`와 `games.length` 값이 일치.
- **TC-M003** 기존 엔트리 삭제 없이 +3 증가.
