# Implementation Plan — p1l-games-batch-20260301-1602

## Phase 1 — Spec/Test 선행
1. slug 중복 검증 완료
2. 게임별 테스트 케이스 정의 완료 후 구현 시작

## Phase 2 — 구현
1. `games/aurora-threadline-pilot/`
   - `index.html`: 곡선 라인 추종 비행, 오브 수집/장애물 회피, 점수/생명/콤보
   - `manifest.webmanifest`
2. `games/kintsugi-circuit/`
   - `index.html`: 타일 회전 퍼즐, 전류 전파 판정, 레벨/이동수/별점
   - `manifest.webmanifest`
3. `games/mycelium-signal-lab/`
   - `index.html`: 3구역 리소스 조절 시뮬, 안정도 계산, 사이클 기반 난이도 상승
   - `manifest.webmanifest`

## Phase 3 — 검증
1. 체크리스트 항목(입력, 오디오, 저장, 반응형, 테마, PWA) 자체 점검
2. 파일 크기 검증(`<500KB`)
3. JS 문법 파싱 검증(Node `new Function`)
4. 90% 미달 시 최대 3회 자동 수정

## Phase 4 — 매니페스트 반영
1. 신규 3개 메타데이터(size/description 포함) 작성
2. `games/manifest.json` 배열 맨 앞에 prepend
3. `count`를 113으로 갱신, `updatedAt` UTC 갱신

## Phase 5 — 마감
1. `gap-analysis.md` 작성(Iteration별 점수 + 갭/해결)
2. git status 확인
3. commit: `feat: +3 games (aurora-threadline-pilot, kintsugi-circuit, mycelium-signal-lab) — total 113`
4. push
