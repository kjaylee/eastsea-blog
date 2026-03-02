# Spec — p1-games-batch-20260301-1213

## 1) Objective
`eastsea-blog/games/`에 신규 HTML5 게임 3종을 제작/추가한다.

1. **echo-chamber** — 음파 반사 퍼즐 (10레벨)
2. **fractal-forest** — L-system 기반 프랙탈 가지치기 시뮬/퍼즐
3. **tempo-tiles** — BPM 가속 무한 리듬 타일

## 2) Global Constraints (All 3)
- 단일 `index.html` (인라인 CSS/JS)
- 파일 크기 `< 500KB`
- **터치 + 키보드** 입력
- **Web Audio API** 사운드
- **localStorage** 최고 기록 저장
- 모바일 반응형
- 네온 다크 테마 (배경 `#0a0a1a`)
- 5+ 레벨 또는 무한 모드
- HTML/JS 구문 에러 없음 (`node --check` 기준)
- PWA `manifest.webmanifest` 제공

## 3) Scope
### In Scope
- 게임 구현 파일
  - `games/echo-chamber/index.html`
  - `games/fractal-forest/index.html`
  - `games/tempo-tiles/index.html`
- PWA 매니페스트
  - 각 게임 폴더 `manifest.webmanifest`
- 카탈로그 업데이트
  - `games/manifest.json`에 신규 3개 엔트리 추가 (기존 엔트리 유지)
- QA 산출물
  - 체크리스트 기반 Gap Analysis
  - 런치 리포트

### Out of Scope
- 외부 라이브러리 도입
- 멀티파일 리팩터
- 기존 게임 수정(필수 동기화 파일 제외)

## 4) Game Specs

## 4.1 echo-chamber
### Core Loop
- Input: 각도 조절(버튼/드래그/키보드)
- Action: 음파 발사 → 벽/반사판 반사
- Reward: 목표 오브젝트 도달 시 레벨 클리어

### Systems
- 10개 레벨(타겟 위치/반사판 구성 다양화)
- 반사 횟수 제한/표시
- 최고 해금 레벨 localStorage 저장

### UX
- 프리뷰 궤적 + 실발사 애니메이션
- 상태 표시(조준/발사/클리어)

## 4.2 fractal-forest
### Core Loop
- Input: 가지 선택/가지치기(터치/클릭 + 키보드)
- Action: L-system 트리에서 서브트리 제거
- Reward: 목표 실루엣(타겟 오버레이) 매칭률 달성 시 클리어

### Systems
- 6개 레벨(각도/반복수/목표컷 seed 변화)
- L-system 문자열 생성 + 터틀 렌더링
- 매칭률 계산, undo/reset 제공
- 최고 해금 레벨 localStorage 저장

### UX
- 목표 트리(마젠타) vs 현재 트리(시안) 오버레이
- 선택 브랜치 하이라이트

## 4.3 tempo-tiles
### Core Loop
- Input: 4레인 탭/키 입력
- Action: 판정 윈도우에 맞춰 노트 타격
- Reward: 정확도/콤보/점수 상승

### Systems
- 무한 모드 + BPM 점진 상승
- Perfect/Good/Miss 판정
- 체력(또는 fail meter) 기반 게임오버
- 최고 점수/최고 콤보 localStorage 저장

### UX
- 비트 펄스/판정 피드백
- 모바일 터치 레인/키보드 D F J K 지원

## 5) Acceptance Criteria
1. 게임 3개 모두 실행 가능, 콘솔 치명 오류 없음
2. 모든 게임에서 터치+키보드 입력 동시 충족
3. 모든 게임에서 Web Audio 재생 트리거 존재
4. 모든 게임에서 localStorage 기록 저장/로드 확인
5. `manifest.webmanifest` 3개 존재 + 링크 연결
6. `games/manifest.json`에 신규 3개만 추가됨(기존 삭제 없음)
7. 각 `index.html` 파일 크기 < 500KB
8. `node --check` 통과

## 6) Risks & Mitigation
- **리스크:** 인라인 JS 복잡도 증가로 구문 오류 가능
  - **완화:** 구현 후 즉시 스크립트 추출 `node --check`
- **리스크:** 터치/키보드 입력 충돌
  - **완화:** `pointer` 이벤트 + `keydown` 별도 처리
- **리스크:** 퍼포먼스 저하
  - **완화:** 캔버스 단순 프리미티브 렌더, 객체 수 제한
