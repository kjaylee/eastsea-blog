# Implementation Plan — p1k-games-batch-20260301-1541

## Phase 1 — Spec/Test 선행
1. slug 중복 검증 및 3개 콘셉트 확정
2. test-cases 문서 확정 후 구현 시작

## Phase 2 — 게임 구현
1. `games/prime-orbit-academy/`
   - `index.html`: 4레인 이동 수집기, 소수/합성수 판별 루프, 점수/생명/속도
   - `manifest.webmanifest`
2. `games/holo-thread-untangler/`
   - `index.html`: 노드 드래그/키보드 이동, 교차선 계산, 레벨 진행
   - `manifest.webmanifest`
3. `games/aether-farm-command/`
   - `index.html`: 4구역 자원 관리, 액션 배분, Day 진행, 수확 점수
   - `manifest.webmanifest`

## Phase 3 — 검증 & 품질 루프
1. 체크리스트 항목별 self QA 스코어링
2. JS 문법 확인(스크립트 추출 후 `new Function` 파싱)
3. 파일 크기 확인(<500KB)
4. 90% 미만 시 자동 보정(최대 3회)

## Phase 4 — 매니페스트 반영
1. 신규 3개 metadata 작성(size/description 포함)
2. `games/manifest.json` games 배열 맨 앞 prepend
3. `count=110`, `updatedAt` 갱신

## Phase 5 — 문서화
1. `gap-analysis.md`에 iteration별 점수 기록
2. 최종 pass/fail 및 근거 정리
