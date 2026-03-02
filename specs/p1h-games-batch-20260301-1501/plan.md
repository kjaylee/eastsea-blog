# Implementation Plan — p1h-games-batch-20260301-1501

## Phase 1 — 설계/검증 준비
1. 기존 `games/manifest.json` slug 목록 확인 및 충돌 없는 slug 확정
2. 게임별 UX/입력/저장 구조 정의
3. 테스트 케이스 문서화 완료 후 구현 착수

## Phase 2 — 구현
1. `games/timeline-switchyard/`
   - `index.html`: 레벨 데이터(6), 이동/타임라인 전환, 레벨 클리어 로직
   - `manifest.webmanifest`: PWA 메타
2. `games/neon-courier-drift/`
   - `index.html`: 무한 액션 루프, 추적 드론 AI, 점수/속도 증가
   - `manifest.webmanifest`
3. `games/gridshift-overseer/`
   - `index.html`: 전력 수요-공급 시뮬레이션, 과열/정전/티어
   - `manifest.webmanifest`

## Phase 3 — 통합 검증
1. index.html 파일 크기 확인(<500KB)
2. `node --check`를 위해 index의 JS를 추출해 문법 검사
3. 체크리스트 기반 self QA 및 점수화
4. 90% 미만 시 즉시 수정(최대 3회)

## Phase 4 — 매니페스트 반영
1. 신규 3개 게임 메타(제목/설명/size/cat/emoji/date) 생성
2. `games/manifest.json` 상단 prepend
3. `count` +3, `updatedAt` 갱신

## Phase 5 — 보고
1. Gap Analysis 결과 기록
2. 생성 파일 목록, 검증 결과, 리스크/후속제안 정리
