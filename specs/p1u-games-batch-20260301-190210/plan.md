# Implementation Plan — p1u-games-batch-20260301-190210

## Phase 0. Preflight
- [x] 작업 디렉토리 확인: `/Users/kjaylee/.openclaw/workspace/eastsea-blog`
- [x] 기존 slug 중복 사전 검사 (`ls games/`)
- [x] 신규 slug 확정
  - crystal-echo-luthier
  - midnight-harbor-pilotage
  - archive-automata-curator

## Phase 1. Spec/Test 선행
- [x] spec.md 작성
- [x] plan.md 작성
- [x] test-cases.md 작성

## Phase 2. 구현
1) `games/crystal-echo-luthier/`
- index.html 단일 파일 구현
- manifest.webmanifest 추가

2) `games/midnight-harbor-pilotage/`
- index.html 단일 파일 구현
- manifest.webmanifest 추가

3) `games/archive-automata-curator/`
- index.html 단일 파일 구현
- manifest.webmanifest 추가

## Phase 3. 검증
- 기능 검증: 시작/플레이/실패/재시작 루프
- 체크리스트 검증:
  - 터치+키보드
  - Web Audio API
  - localStorage
  - 모바일 반응형
  - PWA manifest
  - #0a0a1a 네온 다크
  - 파일 크기 <500KB
- 갭 분석 점수화 (100점 만점)
- 90점 미만 시 최대 3회 자동 수정

## Phase 4. 매니페스트 반영
- `games/manifest.json` 업데이트
  - 신규 3개 항목 prepend
  - count 140 -> 143
  - updatedAt 현재 UTC로 갱신

## Phase 5. 배포 절차
- git status 확인
- commit: `feat: +3 games (crystal-echo-luthier, midnight-harbor-pilotage, archive-automata-curator) — total 143`
- git push
