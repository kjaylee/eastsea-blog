# Test Cases — P1w Games Batch

## A. Common Technical Cases (apply to all 3 games)
- **TC-COM-001**: `index.html` exists and is a single self-contained file (no external deps).
- **TC-COM-002**: `manifest.webmanifest` exists with `background_color` and `theme_color` = `#0a0a1a`.
- **TC-COM-003**: Mobile viewport meta exists and layout remains usable at 390x844.
- **TC-COM-004**: Keyboard input controls core loop.
- **TC-COM-005**: Touch/click controls core loop.
- **TC-COM-006**: Web Audio API (`AudioContext`/`webkitAudioContext`) invoked for effects.
- **TC-COM-007**: `localStorage` used for best/high score persistence.
- **TC-COM-008**: file size check confirms each `index.html` < 500KB.
- **TC-COM-009**: Start → play → failure/win → restart loop works.

## B. Stormglass Skiff Runner
- **TC-SSR-001**: Left/right movement works by keys and touch buttons.
- **TC-SSR-002**: Hazard collision consumes hull.
- **TC-SSR-003**: Beacon collection increases score/chain.
- **TC-SSR-004**: Phase shield (Space/touch) consumes charge and ignores one hazard hit.
- **TC-SSR-005**: Best distance/score persists after refresh.

## C. Moonwell Microgrid Warden
- **TC-MMW-001**: District selection (1/2/3 or touch tabs) updates active panel.
- **TC-MMW-002**: Operation triggers (Q/W/E/R or touch buttons) mutate district metrics.
- **TC-MMW-003**: Pressure escalates by wave and drains resources over time.
- **TC-MMW-004**: Collapse triggers game over with restart path.
- **TC-MMW-005**: Best wave/score persists after refresh.

## D. Sigil Spin Vault
- **TC-SSV-001**: Ring rotations respond to keyboard and touch controls.
- **TC-SSV-002**: Correct alignment clears lock and advances stage.
- **TC-SSV-003**: Move/time budget decreases correctly and fail state triggers.
- **TC-SSV-004**: Stage scaling increases challenge (locks/move limits).
- **TC-SSV-005**: Best stage/score persists after refresh.

## Pass Criteria
- All common test cases pass for each game.
- At least 90% checklist compliance per game in gap analysis.
