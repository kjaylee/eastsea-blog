# Launch Report — amber-harbor-ledger

## Delivered slice
- Game: **Amber Harbor Ledger**
- Route: `/games/amber-harbor-ledger/`
- Type: mobile-first HTML5 vertical slice

## Implemented assets
- `games/amber-harbor-ledger/index.html`
- `games/amber-harbor-ledger/app.mjs`
- `games/amber-harbor-ledger/logic.mjs`
- `tests/unit/amber-harbor-ledger.test.mjs`
- `games/manifest.json` (new game entry)

## Core feature checklist
- [x] 2개 이상 메카닉 조합
- [x] 고유 메카닉 구현 (Wake Weave Dividend / Congestion Toll)
- [x] 리듬게임 요소 배제
- [x] neon dark 배색 배제
- [x] 단위테스트 + 스모크 검증 완료

## Quick run
```bash
cd eastsea-blog
python3 -m http.server 8080
# open http://127.0.0.1:8080/games/amber-harbor-ledger/
```

## Notes
- 저장키: `amber_harbor_ledger_save_v1`
- Wake Weave/Congestion 상태는 우측 HUD에서 실시간 확인 가능
