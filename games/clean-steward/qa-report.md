# QA Report — clean-steward

- 일자: 2026-09-01 22:2x KST (일일 Plan-Do-See 크론 내 실행)
- 방식: 단일 파일에서 `<script>` 추출 → `node --check` → DOM 스팀 헤드리스 하니스(`/tmp/qa-harness.js`)로 QA IIFE 실구동
- 결과: **17/17 PASS, pageErrors = []**

## 정적 검증

- `node --check`: 구문 오류 0 (초안 1건 — QA 블록 여는 IIFE 누락 — 수정 후 통과)
- HTML 헤더 주석: 연구 원천 2건 명시 확인 (v7 도핑 문서, equine-science 부상 문서)

## 어설션 결과

| # | 어설션 | 결과 |
|---|---|---|
| 1 | seeded determinism (deck) | PASS |
| 2 | steroid +22 fit | PASS |
| 3 | steroid +2 heat | PASS |
| 4 | heat decay 0.5 | PASS |
| 5 | catchProb 0 at heat 0 | PASS |
| 6 | catchProb cap at heat 10 (85%) | PASS |
| 7 | clean test pass (+4 rep) | PASS |
| 8 | caught suspension 6w | PASS |
| 9 | caught rep -25 & strike | PASS |
| 10 | 2nd catch = ban ending | PASS |
| 11 | rehab 3w / fast 1w + heat | PASS |
| 12 | recurrence risk >45% (SDFT 50% 반영) | PASS |
| 13 | race win path | PASS |
| 14 | season ends at week 12 | PASS |
| 15 | clean bonus 300 only if no dope | PASS |
| 16 | full-season determinism (seed 77) | PASS |
| 17 | render text sanity (no NaN/undefined) | PASS |

## 수정 이력 (빌드 중 적발)

1. QA 블록 #1 여는 `(function(){` 누락 → node --check에서 적발, 즉시 수정.
2. `rngRef()` 호출 결과(숫자)를 RNG 함수 자리에 전달하던 버그 5곳 → 함수 전달로 수정 (헤드리스 pageErrors로 적발).
3. 강제 적발 테스트 rng값 0.99 → 0.85 상한 초과로 미적발이던 논리 오류 → 0.0으로 수정.

## 발행 검증

- 커밋: (아래 기입)
- 라이브 검증: `https://eastsea-blog.pages.dev/clean-steward/` HTTP 상태 — (아래 기입)
