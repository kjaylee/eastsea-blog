# Test Cases — P1P Batch (3 Games)

## Global Preconditions
- Browser supports Canvas + Web Audio + localStorage.
- Device targets: desktop keyboard, mobile touch.

---

## A. Glyph Lantern Keeper
- TC-GLK-001: Initial render shows HUD, 4 pads, start button.
- TC-GLK-002: Start begins sequence flash and input window.
- TC-GLK-003: Keyboard A/S/D/F activates matching pads.
- TC-GLK-004: Touch tap activates matching pads.
- TC-GLK-005: Correct full sequence advances round and score.
- TC-GLK-006: Wrong input triggers fail state with restart.
- TC-GLK-007: Audio tone plays on pad input and fail/success.
- TC-GLK-008: Best score persists after reload.
- TC-GLK-009: At 390x844 layout remains usable with no overflow.

## B. Tidal Vault Allocator
- TC-TVA-001: Initial render shows 3 district panels + action controls.
- TC-TVA-002: Keyboard 1/2/3 selects district.
- TC-TVA-003: Keyboard Q/W/E applies Drain/Store/Shield action.
- TC-TVA-004: Touch buttons select district and action.
- TC-TVA-005: End turn simulation updates flood/stability/energy values.
- TC-TVA-006: Critical threshold triggers game over and restart path.
- TC-TVA-007: Audio cue plays on action and turn tick.
- TC-TVA-008: Best round/score persists after reload.
- TC-TVA-009: 360x800 viewport keeps controls reachable without horizontal scroll.

## C. Comet Kite Harbor
- TC-CKH-001: Initial render shows lanes, kite, HUD, controls.
- TC-CKH-002: Keyboard Left/Right (or A/D) changes lane.
- TC-CKH-003: Space triggers short boost.
- TC-CKH-004: Touch left/right/boost buttons operate equivalently.
- TC-CKH-005: Orb pickup increases charge and score with SFX.
- TC-CKH-006: Debris collision reduces life; at 0 life game ends.
- TC-CKH-007: Game speed scales over time.
- TC-CKH-008: Best distance persists after reload.
- TC-CKH-009: Mobile viewport displays full gameplay + controls.

---

## Integration / Repo
- TC-INT-001: New slugs do not exist in prior `ls games/` set.
- TC-INT-002: Each game folder contains `index.html` + `manifest.webmanifest`.
- TC-INT-003: Every `index.html` size < 500KB.
- TC-INT-004: `games/manifest.json` has 3 new entries prepended.
- TC-INT-005: `games/manifest.json` count == 125 and updatedAt refreshed.
