# Launch Report — sunpetal-magnet-foundry

## Delivered slice
- Game: **Sunpetal Magnet Foundry**
- Route: `/games/sunpetal-magnet-foundry/`
- Type: mobile-first HTML5 vertical slice

## Implemented assets
- `games/sunpetal-magnet-foundry/index.html`
- `games/sunpetal-magnet-foundry/app.mjs`
- `games/sunpetal-magnet-foundry/logic.mjs`
- `tests/unit/sunpetal-magnet-foundry.test.mjs`
- `games/manifest.json` (new game entry)

## Core feature checklist
- [x] 2개 이상 메카닉 조합
- [x] 고유 메카닉 구현
- [x] 리듬게임 요소 배제
- [x] neon dark 배색 배제
- [x] 단위테스트 + 스모크 검증 완료

## Quick run
```bash
cd eastsea-blog
python3 -m http.server 8080
# open http://127.0.0.1:8080/games/sunpetal-magnet-foundry/
```

## Notes
- 저장키: `sunpetal_magnet_foundry_save_v1`
- Prism Flip Dividend/Static Drag는 정산 패널티·보너스로 즉시 확인 가능
