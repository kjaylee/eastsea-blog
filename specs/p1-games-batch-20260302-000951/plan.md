# Implementation Plan — P1 Games Batch (20260302-000951)

## Phase 0. Precheck
- [x] `ls games/`로 slug 중복 확인
- [x] 기존 manifest 구조 파악

## Phase 1. Spec/Test First
- [x] `spec.md` 작성
- [x] `test-cases.md` 작성 (구현 전)
- [x] 체크리스트 명시 (touch+keyboard, Web Audio, localStorage, responsive, PWA, neon dark, size)

## Phase 2. Build
- [x] Game A 구현: orbital-packet-weaver
- [x] Game B 구현: treaty-terminal-director
- [x] Game C 구현: balance-beacon-foundry
- [x] 각 게임 manifest.webmanifest 작성

## Phase 3. Verification
- [x] 파일 존재/크기 검증
- [x] checklist 정량 점수화
- [x] gap-analysis 문서화
- [x] 90% 미만 항목 자동 수정 (해당 없음: 100% pass)

## Phase 4. Registry + Git
- [x] `games/manifest.json` 신규 3개 prepend
- [x] `count` + `updatedAt` 갱신
- [ ] 변경 파일만 git add
- [ ] commit
- [ ] push

## Risk Controls
- slug 충돌 방지: 생성 직전/직후 재확인
- JSON 파손 방지: Python으로 manifest 업데이트
- 입력 누락 방지: 키보드+터치 핸들러를 테스트 케이스로 강제
