# Test Cases — p1f-games-batch-20260301-1404

## A) Shared Compliance
- **TC-C001** 각 게임은 단일 `index.html`로 구성되어야 한다.
- **TC-C002** 각 `index.html` 파일 크기는 `< 500KB`여야 한다.
- **TC-C003** CSS/배경에 `#0a0a1a` 네온 다크 테마가 존재해야 한다.
- **TC-C004** 390x844 모바일 해상도에서 HUD/컨트롤이 화면에 표시되어야 한다.
- **TC-C005** 터치 입력으로 핵심 액션이 가능해야 한다.
- **TC-C006** 키보드 입력으로 동일 핵심 액션이 가능해야 한다.
- **TC-C007** 사용자 액션 시 Web Audio API 사운드가 발생해야 한다.
- **TC-C008** 점수(localStorage) 저장/재로딩이 동작해야 한다.
- **TC-C009** `manifest.webmanifest` 존재 + HTML 링크 연결.
- **TC-C010** 인라인 JS 추출 후 `node --check` 통과.

## B) Plasma Pong
- **TC-P001** AI 패들과 랠리가 동작해야 한다.
- **TC-P002** 파워업 아이템이 스폰/획득/효과 적용되어야 한다.
- **TC-P003** 플레이어 점수/생명/난이도 UI가 갱신되어야 한다.
- **TC-P004** 무한 진행이 가능하며 게임오버 후 재시작 가능해야 한다.
- **TC-P005** `plasmaPongBestScore` 저장/로드.

## C) Cipher Lock
- **TC-L001** 총 10레벨이 순차 진행되어야 한다.
- **TC-L002** 숫자 입력(키보드/터치) 및 삭제/제출이 동작해야 한다.
- **TC-L003** 추측 피드백(정확 위치/포함/불일치)이 출력되어야 한다.
- **TC-L004** 레벨 타이머 만료 시 실패 처리되어야 한다.
- **TC-L005** 레벨 클리어 시 다음 레벨로 전환되어야 한다.
- **TC-L006** `cipherLockBestScore` 저장/로드.

## D) Spore Colony
- **TC-S001** 무한 모드로 시간 경과 시 난이도(소비/독성)가 상승해야 한다.
- **TC-S002** 분열/채집/업그레이드/정화 액션이 동작해야 한다.
- **TC-S003** 자원(에너지/영양/바이오매스) 수치가 실시간 갱신되어야 한다.
- **TC-S004** 스포어 수 및 독성 이벤트가 시각화되어야 한다.
- **TC-S005** 게임오버 및 재시작 루프가 동작해야 한다.
- **TC-S006** `sporeColonyBestScore` 저장/로드.

## E) Manifest Sync
- **TC-M001** `games/manifest.json`에 신규 slug 3개(`plasma-pong`,`cipher-lock`,`spore-colony`)가 존재해야 한다.
- **TC-M002** `count === games.length`가 성립해야 한다.
- **TC-M003** 기존 엔트리 삭제 없이 +3 증가해야 한다.
