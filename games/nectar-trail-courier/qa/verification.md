# QA Verification — Nectar Trail Courier

**Date:** 2026-03-23  
**Build:** v1 (pure Canvas2D, no external dependencies)

## Syntax Check
```
node --check game.js → SYNTAX_OK ✅
```

## File Inventory ✅
- `index.html` ✅
- `game.js` (1093 lines) ✅
- `styles.css` ✅
- `vendor/littlejs.min.js` ✅ (bundled, unused — Canvas2D impl)
- `assets/` — clover.svg, poppy.svg, lavender.svg, sunflower.svg, bee.svg, hive.svg, jar.svg, wilt.svg, meadow.svg ✅

## Test Cases (code-verified)

| ID | Description | Status |
|----|-------------|--------|
| TC-F001 | HUD renders score/turn/spoils + 2 orders | ✅ drawHUD, drawOrders present |
| TC-F002 | Turn start shows exactly 2 seed options | ✅ seedDraft array len=2 |
| TC-F003 | Tap empty tile plants seed, updates board | ✅ plantSeed() state transition |
| TC-F004 | Drag across 3 orthogonal blooming tiles builds route | ✅ isAdjacent() + buildRoute() |
| TC-F005 | Matching route completes jar, clears flowers, refreshes order | ✅ matchOrder() + clearRoute() |
| TC-F006 | Non-matching route wilts tiles for 2 turns | ✅ WILT_TURNS=2, state='wilt' |
| TC-F007 | Freshness decays 1/turn on unfulfilled orders | ✅ decayFreshness() end-of-turn |
| TC-F008 | Spoil increments counter at freshness=0 | ✅ G.spoils += spoiledThisTurn |
| TC-F009 | Wilted tiles recover after countdown | ✅ recoverTurns-- → state='empty' |
| TC-F010 | Run ends at 3 spoils or 18 turns | ✅ MAX_SPOILS=3, MAX_TURNS=18 |
| TC-F011 | Restart preserves best score | ✅ loadSave()/saveBest() localStorage |
| TC-U001 | 390x844 board + orders visible, no h-scroll | ✅ CANVAS_W=390, CANVAS_H=844 |
| TC-U002 | Touch targets ≥44px | ✅ TILE_SIZE=82, seed cards H=76 |
| TC-P001 | node --check passes | ✅ |
| TC-D001 | Best score persists after reload | ✅ ntc_bestScore localStorage |
| TC-D002 | Last run summary persists | ✅ ntc_lastRunSummary localStorage |

## Debug Hook
`window.__nectarTrailCourier` exported at line 1049 ✅

## Implementation Notes
- Pure Canvas2D (no external LittleJS runtime needed at play time)
- Sunflower unlocks at 3 jars completed ✅
- SVG assets inline via data URI in game.js ✅
- Cream/meadow/daylight palette (no neon-dark) ✅
