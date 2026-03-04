# Plan — relay-merge-raiders

1. Build pure game logic (`games/relay-merge-raiders/logic.mjs`)
   - State lifecycle: dock ↔ wave.
   - Lane movement, spawn/step, collision, settlement.
   - Merge, sponsor, premium economy actions.

2. Build playable UI (`games/relay-merge-raiders/index.html`, `app.mjs`)
   - Canvas lane renderer + HUD + control panel.
   - Touch/keyboard controls.
   - LocalStorage load/save.

3. Add deterministic tests
   - New unit suite: `tests/unit/relay-merge-raiders.test.mjs`.
   - Cover phase transitions, collisions, merge behavior, monetization multipliers.

4. Register build for discovery
   - Update `games/manifest.json` with new route entry.

5. Verify with explicit evidence
   - `node --check` syntax checks.
   - `node --test` for new suite.
   - Manifest presence check + local route title curl smoke test.
