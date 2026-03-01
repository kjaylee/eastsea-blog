# Test Cases — P1Q Batch (3 Games)

## Global Preconditions
- Modern browser with Canvas/Web Audio/localStorage enabled.
- Validation on desktop keyboard and mobile touch layout.

---

## A. Lighthouse Lens Labyrinth
- TC-LLL-001: First load shows puzzle grid, HUD, stage, score, restart.
- TC-LLL-002: Arrow keys move selected tile cursor.
- TC-LLL-003: Space/Enter rotates selected tile.
- TC-LLL-004: Touch tap rotates tapped tile.
- TC-LLL-005: Beam path updates after each rotation.
- TC-LLL-006: Stage clear triggers SFX and next-stage progression.
- TC-LLL-007: Best stage and score persist after reload.
- TC-LLL-008: Mobile viewport (390x844) has no horizontal overflow.

## B. Junkyard Joule Juggler
- TC-JJJ-001: First load shows playfield, score/lives/streak, controls.
- TC-JJJ-002: Keyboard A/D or ←/→ moves catcher.
- TC-JJJ-003: Space toggles polarity mode.
- TC-JJJ-004: Touch left/right/toggle buttons work equivalently.
- TC-JJJ-005: Battery catch increases score and streak.
- TC-JJJ-006: Bomb hit reduces life and resets streak.
- TC-JJJ-007: Game over persists best score/streak.
- TC-JJJ-008: Mobile viewport (360x800) keeps controls accessible.

## C. Relic Auction Rush
- TC-RAR-001: First load shows round, net worth, reputation, lot list, bid controls.
- TC-RAR-002: Keyboard 1/2/3 selects lot.
- TC-RAR-003: Keyboard Q/W/E selects bid tier.
- TC-RAR-004: Enter resolves round with chosen lot + bid.
- TC-RAR-005: Touch buttons for lot/bid/confirm operate correctly.
- TC-RAR-006: Fake relic outcomes penalize net worth/reputation.
- TC-RAR-007: Reputation <= 0 triggers game over state.
- TC-RAR-008: Best round and net worth persist after reload.

---

## Integration / Repo
- TC-INT-001: New slugs are absent from existing `games/*` before creation.
- TC-INT-002: Each new game folder includes `index.html` and `manifest.webmanifest`.
- TC-INT-003: Each new `index.html` file size is < 500KB.
- TC-INT-004: `games/manifest.json` has these 3 entries prepended in order.
- TC-INT-005: `games/manifest.json` count is 131 and updatedAt refreshed.
- TC-INT-006: `git status` shows only intended files changed.
