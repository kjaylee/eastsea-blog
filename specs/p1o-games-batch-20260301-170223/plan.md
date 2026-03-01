# Plan — p1o-games-batch-20260301-170223

## Step 1) 설계/테스트 선행
- spec.md / plan.md / test-cases.md 먼저 작성
- slug 중복 재검증

## Step 2) 게임 3종 구현
- `games/braille-beacon-operator/index.html` + `manifest.webmanifest`
- `games/thermal-drone-orchard/index.html` + `manifest.webmanifest`
- `games/gravity-calligraphy-duel/index.html` + `manifest.webmanifest`
- 공통 UI: `#0a0a1a` 네온 다크, 모바일 우선, 터치/키보드 동시 지원
- 공통 시스템: Web Audio API 효과음, localStorage 저장

## Step 3) 검증
- `node --check`로 JS 문법 확인
- `wc -c`로 파일 크기 확인 (<500KB)
- 체크리스트 항목별 수동 점검

## Step 4) Gap Analysis + 자동 보정
- 체크리스트 대비 점수화
- 90% 미만 시 수정 후 재측정 (최대 3회)

## Step 5) Manifest 반영
- `games/manifest.json`에 신규 3개를 배열 맨 앞 prepend
- `count` 122, `updatedAt` 현재 UTC ISO로 갱신

## Step 6) Git 마감
- 변경 파일 검토
- 커밋: `feat: +3 games (braille-beacon-operator, thermal-drone-orchard, gravity-calligraphy-duel) — total 122`
- 원격 push
