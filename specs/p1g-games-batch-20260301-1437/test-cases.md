# Test Cases — p1g-games-batch-20260301-1437

## A) Shared Compliance
- **TC-C001** 각 게임은 단일 `index.html`로 구성되어야 한다.
- **TC-C002** 각 `index.html` 파일 크기는 `< 500KB`여야 한다.
- **TC-C003** CSS/배경에 `#0a0a1a` 네온 다크 테마가 존재해야 한다.
- **TC-C004** 390x844 모바일 해상도에서 HUD/컨트롤이 화면 내 표시되어야 한다.
- **TC-C005** 터치 입력으로 핵심 액션이 가능해야 한다.
- **TC-C006** 키보드 입력으로 동일 핵심 액션이 가능해야 한다.
- **TC-C007** 사용자 액션 시 Web Audio API 사운드가 발생해야 한다.
- **TC-C008** 점수(localStorage) 저장/재로딩이 동작해야 한다.
- **TC-C009** `manifest.webmanifest` 존재 + HTML 링크 연결.
- **TC-C010** 인라인 JS 추출 후 `node --check` 통과.

## B) Phase Weaver Rails
- **TC-PW001** 좌/우 레일 이동 입력(터치/키보드)이 동작해야 한다.
- **TC-PW002** 위상 토글 입력(버튼/Space)이 동작해야 한다.
- **TC-PW003** 게이트 레일+위상 판정으로 점수/생명 변화가 일어나야 한다.
- **TC-PW004** 점수 기반 Tier 상승 및 속도 증가가 동작해야 한다.
- **TC-PW005** `phaseWeaverRailsBest` 저장/로드.

## C) Pulse Orchard
- **TC-PO001** 5레인 이동(터치/키보드)이 동작해야 한다.
- **TC-PO002** Harvest/Purge 모드 전환이 동작해야 한다.
- **TC-PO003** ripe/thorn 처리 결과에 따라 점수/생명이 변화해야 한다.
- **TC-PO004** 시즌(Tier) 상승에 따라 난이도가 증가해야 한다.
- **TC-PO005** `pulseOrchardBest` 저장/로드.

## D) Ion Drift Warden
- **TC-IW001** 실드 회전 입력(키보드/터치)이 동작해야 한다.
- **TC-IW002** 실드 아크 반사 판정이 정상 동작해야 한다.
- **TC-IW003** 코어 피격 시 생명 감소 및 게임오버 루프가 동작해야 한다.
- **TC-IW004** Tier 상승에 따라 탄속/스폰 난이도가 증가해야 한다.
- **TC-IW005** `ionDriftWardenBest` 저장/로드.

## E) Manifest Sync
- **TC-M001** `games/manifest.json`에 신규 slug 3개(`phase-weaver-rails`,`pulse-orchard`,`ion-drift-warden`)가 존재해야 한다.
- **TC-M002** `count === games.length`가 성립해야 한다.
- **TC-M003** 기존 엔트리 삭제 없이 +3 증가해야 한다.
