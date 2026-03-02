# Test Cases — p1-games-batch-20260301-1213

## A) Shared Compliance (All Games)
- **TC-C001** 단일 `index.html`만으로 실행되어야 한다.
- **TC-C002** 각 `index.html` 파일 크기는 500KB 미만이어야 한다.
- **TC-C003** 배경색/테마에 `#0a0a1a` 기반 네온 다크 톤이 적용되어야 한다.
- **TC-C004** 모바일(390x844)에서 HUD/컨트롤이 화면 폭 내 렌더링되어야 한다.
- **TC-C005** 터치 입력으로 핵심 액션(이동/선택/타격)이 가능해야 한다.
- **TC-C006** 키보드 입력으로 동일 핵심 액션이 가능해야 한다.
- **TC-C007** Web Audio API 사운드 함수가 사용자 입력 기반으로 동작해야 한다.
- **TC-C008** localStorage 최고 기록(최고 레벨/점수/콤보)이 저장되고 재실행 시 로드되어야 한다.
- **TC-C009** `manifest.webmanifest` 파일이 존재하고 `link rel="manifest"`로 연결되어야 한다.
- **TC-C010** 인라인 JS를 추출한 뒤 `node --check` 통과해야 한다.

## B) echo-chamber
- **TC-E001** 10개 레벨이 존재하고 레벨 인덱스가 HUD에 표시되어야 한다.
- **TC-E002** 각도 조절(버튼/키보드/드래그)로 발사 방향이 즉시 갱신되어야 한다.
- **TC-E003** 발사한 음파가 벽/반사판에서 반사 궤적을 생성해야 한다.
- **TC-E004** 목표 적중 시 클리어 사운드와 다음 레벨 전환이 발생해야 한다.
- **TC-E005** 최고 해금 레벨이 localStorage에 저장되어야 한다.

## C) fractal-forest
- **TC-F001** L-system 문자열 기반 트리 생성이 레벨별 파라미터를 반영해야 한다.
- **TC-F002** 가지 선택/가지치기(터치/키보드)가 동작해야 한다.
- **TC-F003** 타겟 오버레이와 현재 트리 매칭률이 HUD에 표시되어야 한다.
- **TC-F004** 매칭 임계치 도달 시 레벨 클리어 처리되어야 한다.
- **TC-F005** Undo/Reset 동작이 가지치기 상태를 복원해야 한다.
- **TC-F006** 최고 해금 레벨이 localStorage에 저장되어야 한다.

## D) tempo-tiles
- **TC-T001** 무한 모드에서 BPM이 시간이 지날수록 증가해야 한다.
- **TC-T002** 4레인 입력(터치/키보드 D F J K)이 노트 판정에 반영되어야 한다.
- **TC-T003** Perfect/Good/Miss 판정 및 콤보가 점수에 반영되어야 한다.
- **TC-T004** 미스 누적으로 게임오버 상태가 발생해야 한다.
- **TC-T005** 최고 점수/최고 콤보가 localStorage에 저장되어야 한다.

## E) Manifest Sync
- **TC-M001** `games/manifest.json`에 신규 slug 3개(`echo-chamber`, `fractal-forest`, `tempo-tiles`)가 추가되어야 한다.
- **TC-M002** 기존 slug 수가 감소하지 않아야 한다(기존 엔트리 삭제 금지).
