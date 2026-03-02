# Implementation Plan — p1j-games-batch-20260301-1532

## Phase 1 — Spec/Test 선행
1. slug 중복 점검 완료 상태에서 게임 3종 상세 설계 확정
2. 테스트 케이스 문서 작성 완료 후 구현 시작

## Phase 2 — 게임 구현
1. `games/mirror-vault-heist/`
   - `index.html`: 격자 이동, 미러 전환, 레이저/키/출구, 6스테이지, 최고 스테이지 저장
   - `manifest.webmanifest`
2. `games/tidal-signal-operator/`
   - `index.html`: 위험지수 시뮬레이션, 3개 장비 토글, Shift 진행, 최고 점수 저장
   - `manifest.webmanifest`
3. `games/skyline-seed-runner/`
   - `index.html`: 관성 이동, 캡슐 수거/투하, 장애물 회피, 콤보/최고 점수 저장
   - `manifest.webmanifest`

## Phase 3 — 통합 검증
1. 파일 크기 측정(<500KB)
2. JS 문법 검사(`node --check`)
3. 체크리스트 기준 self QA 점수화
4. 90% 미만이면 즉시 보정(최대 3회)

## Phase 4 — manifest 반영
1. 신규 3개 메타 데이터 생성(emoji/cat/description/size)
2. `games/manifest.json` 배열 앞에 prepend
3. `count`, `updatedAt` 갱신

## Phase 5 — 보고
1. Gap analysis 문서화
2. slug/용량/검증 결과/달성률 보고
