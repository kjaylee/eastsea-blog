# Test Cases — P1Q Batch (3 Games)

## Global Preconditions
- Browser supports Canvas, Web Audio API, and localStorage.
- Validation targets include desktop keyboard and mobile touch.

---

## A. Seismograph Scribe
- TC-SES-001: Initial render shows waveform panel, score HUD, and controls.
- TC-SES-002: Start begins 75s session and scrolling waveform.
- TC-SES-003: Keyboard ↑/↓ (or W/S) moves cursor vertically.
- TC-SES-004: Touch UP/DOWN controls move cursor equivalently.
- TC-SES-005: Close tracking increases combo and score.
- TC-SES-006: Drift/miss breaks combo and triggers miss feedback.
- TC-SES-007: Web Audio tone plays on good trace and miss events.
- TC-SES-008: Best score + accuracy persist after reload.
- TC-SES-009: 390x844 viewport has no horizontal overflow.

## B. Bonsai Windkeeper
- TC-BWK-001: Initial render shows 3 bonsai cards and global HUD.
- TC-BWK-002: Keyboard 1/2/3 selects bonsai lane.
- TC-BWK-003: Keyboard Q/W/E applies Mist/Fan/Lamp action.
- TC-BWK-004: Touch buttons perform select/actions equivalently.
- TC-BWK-005: Tick simulation updates moisture/wind/light and vitality.
- TC-BWK-006: Critical stat drain can cause vitality collapse and game over.
- TC-BWK-007: Web Audio cue plays on action and danger alert.
- TC-BWK-008: Best round + serenity score persist after reload.
- TC-BWK-009: 360x800 viewport keeps controls reachable.

## C. Paper Plane Thermals
- TC-PPT-001: Initial render shows sky lane, plane, HUD, and control buttons.
- TC-PPT-002: Keyboard ↑/↓ (or W/S) changes altitude trajectory.
- TC-PPT-003: Space triggers temporary boost.
- TC-PPT-004: Touch Climb/Dive/Boost buttons mirror keyboard behavior.
- TC-PPT-005: Passing through ring increases combo and score.
- TC-PPT-006: Cloud collision reduces life and flashes damage state.
- TC-PPT-007: Web Audio cues play for ring, hit, and boost.
- TC-PPT-008: Best distance + combo persist after reload.
- TC-PPT-009: Mobile viewport keeps playfield and controls visible.

---

## Integration / Repo
- TC-INT-001: New slugs do not exist in prior `ls games/` set.
- TC-INT-002: Each new game folder contains `index.html` + `manifest.webmanifest`.
- TC-INT-003: Every new `index.html` size < 500KB.
- TC-INT-004: `games/manifest.json` has 3 new entries prepended.
- TC-INT-005: `games/manifest.json` count == 128 and `updatedAt` refreshed.
