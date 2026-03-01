# P1 Games Batch Spec — 20260302-000240

## 목표
신규 HTML5 게임 3종을 `games/{slug}/index.html` + `games/{slug}/manifest.webmanifest`로 제작하고,
`games/manifest.json`에 3개 항목을 **배열 맨 앞 prepend** 후 `count: 191`로 갱신한다.

## 신규 게임 라인업 (장르 다양화)
1. **sonar-trench-sweeper** (action)
   - 콘셉트: 심해 드론을 좌우 이동/액티브 소나로 조종해 구조 포드를 수집하고 기뢰를 회피하는 생존 액션.
   - 코어 루프: 입력(이동/핑) → 포드 회수 및 장애물 회피 → 점수/콤보 누적.

2. **constellation-knot-forge** (puzzle)
   - 콘셉트: 별자리 노드(5x5)를 선택해 링크를 회전/반전해 목표 성좌 패턴과 일치시키는 라운드 퍼즐.
   - 코어 루프: 입력(노드 선택) → 행/열 링크 토글 → 목표 매칭률 상승.

3. **cloud-harvest-director** (simulation)
   - 콘셉트: 3개 기상 채널(응결/저장/분배)을 실시간 조절해 수자원 수요 파동을 안정화하는 운영 시뮬레이션.
   - 코어 루프: 입력(채널 부스트) → 자원 밸런스 회복 → 웨이브 생존 점수 획득.

## 공통 기술/품질 제약
- 단일 파일: 각 게임 로직/CSS/HTML를 `index.html` 1개에 내장 (외부 의존성 없음)
- 입력: 키보드 + 터치 동시 지원
- 사운드: Web Audio API로 SFX 재생
- 저장: localStorage 최고기록 저장
- UI: 모바일 반응형 + 네온 다크 테마 (`#0a0a1a` 기반)
- 용량: 각 `index.html` 500KB 미만
- PWA: 각 폴더 `manifest.webmanifest` 작성

## 산출물
- `games/sonar-trench-sweeper/index.html`
- `games/sonar-trench-sweeper/manifest.webmanifest`
- `games/constellation-knot-forge/index.html`
- `games/constellation-knot-forge/manifest.webmanifest`
- `games/cloud-harvest-director/index.html`
- `games/cloud-harvest-director/manifest.webmanifest`
- `games/manifest.json` (prepend + count + updatedAt)

## 완료 정의
- 3개 게임 실행 가능, 필수 체크리스트(터치+키보드/Web Audio/localStorage/반응형/PWA/#0a0a1a/<500KB) 충족
- 갭 분석 점수 90% 이상
- 커밋/푸시: `feat: +3 games (sonar-trench-sweeper, constellation-knot-forge, cloud-harvest-director) — total 191`
