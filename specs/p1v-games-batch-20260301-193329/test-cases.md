# Test Cases — P1v Games Batch

## A. Common Technical Cases (apply to all 3 games)
- **TC-COM-001**: `index.html` exists and is a single self-contained file (no external deps).
- **TC-COM-002**: `manifest.webmanifest` exists with `background_color` and `theme_color` = `#0a0a1a`.
- **TC-COM-003**: Mobile viewport meta exists and layout remains usable at 390x844.
- **TC-COM-004**: Keyboard input controls core loop.
- **TC-COM-005**: Touch/click controls core loop.
- **TC-COM-006**: Web Audio API (`AudioContext`/`webkitAudioContext`) invoked for effects.
- **TC-COM-007**: `localStorage` used for best/high score persistence.
- **TC-COM-008**: file size check confirms each `index.html` < 500KB.
- **TC-COM-009**: Start → play → game over/fail/win → restart loop works.

## B. Aurora Rail Rescue
- **TC-ARR-001**: Left/right movement works by keys and touch buttons.
- **TC-ARR-002**: Hazard collision reduces shield/life.
- **TC-ARR-003**: Rescue pod collection increases score/chain.
- **TC-ARR-004**: Pulse action (Space/touch) consumes charge and clears nearby hazard.
- **TC-ARR-005**: Best distance/score persists after refresh.

## C. Clockwork Reef Keeper
- **TC-CRK-001**: Zone selection (1/2/3 or touch tabs) changes active zone.
- **TC-CRK-002**: Action triggers (Q/W/E or touch buttons) mutate zone stats.
- **TC-CRK-003**: Global pressure escalates over rounds.
- **TC-CRK-004**: Stability scoring updates and game-over triggers on collapse.
- **TC-CRK-005**: Best wave/score persists after refresh.

## D. Echo Mosaic Forge
- **TC-EMF-001**: Sequence playback announces tones/visual flashes.
- **TC-EMF-002**: Player reproduces sequence via keyboard and touch pads.
- **TC-EMF-003**: Correct sequence advances round and increases difficulty.
- **TC-EMF-004**: Wrong input or timeout decreases life/progress and can end run.
- **TC-EMF-005**: Best round/score persists after refresh.

## Pass Criteria
- All common test cases pass for each game.
- At least 90% checklist compliance per game in gap analysis.
