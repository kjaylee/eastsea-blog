# Plan — P1n Games Batch (3)

## 1) Preflight
- [x] 작업 경로 확인: `/Users/kjaylee/.openclaw/workspace/eastsea-blog`
- [x] 기존 slug 중복 점검 (`ls games/`)
- [x] Spec/Test 선작성

## 2) Build Slice A — constellation-courier-zipline
- [x] `games/constellation-courier-zipline/index.html` 구현
- [x] `games/constellation-courier-zipline/manifest.webmanifest` 작성
- [x] 입력(터치+키보드), 오디오, 저장, 반응형 검증

## 3) Build Slice B — reef-ledger-keeper
- [x] `games/reef-ledger-keeper/index.html` 구현
- [x] `games/reef-ledger-keeper/manifest.webmanifest` 작성
- [x] 입력(터치+키보드), 오디오, 저장, 반응형 검증

## 4) Build Slice C — origami-rescue-grid
- [x] `games/origami-rescue-grid/index.html` 구현
- [x] `games/origami-rescue-grid/manifest.webmanifest` 작성
- [x] 입력(터치+키보드), 오디오, 저장, 반응형 검증

## 5) Batch Integration
- [x] HTML 파일 사이즈 측정 (<500KB)
- [x] `games/manifest.json` prepend 3개 + count/updatedAt 갱신
- [x] JSON lint/파싱 검증

## 6) QA + Gap Analysis Loop
- [x] 체크리스트 기준 점수화(100점 만점)
- [x] 90점 미만 항목 자동 수정 (최대 3회)
- [x] 최종 라운드 리포트 작성

## 7) Delivery
- [x] git add (관련 파일만)
- [x] commit: `feat: +3 games (slugs) — total 119`
- [x] git push