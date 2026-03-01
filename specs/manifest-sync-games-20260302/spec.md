# Game Spec — manifest-sync-games-20260302

## Scope
Ship 3 new original HTML5 games under `games/` with single-file `index.html` per game.

## Global Constraints
- Single HTML file per game (`games/<slug>/index.html`)
- File size < 500KB
- Mobile-first neon dark theme (`#0a0a1a`)
- Input: touch + keyboard
- Audio: Web Audio API effects
- Persistence: localStorage best score
- Include PWA manifest metadata

## Game 1 — pulse-lantern-orbit
### Core Loop
- Input: Left/Right (or touch hold left/right zones) to rotate around a core.
- Action: Intercept matching color pulses, avoid mismatched pulses.
- Reward: Combo multiplier and survival score.

### Systems
- Progression: pulse speed and spawn rate ramp over time.
- Economy: combo meter increases points.
- Save/Load: best score saved in localStorage.

## Game 2 — echo-drift-harvester
### Core Loop
- Input: move across 3 lanes (A/D or swipe/tap lane buttons).
- Action: harvest echo shards, dodge static spikes.
- Reward: score + tempo chain bonuses.

### Systems
- Progression: faster lane scroll and denser hazards.
- Economy: chain counter boosts shard value.
- Save/Load: best score saved in localStorage.

## Game 3 — void-garden-sentinel
### Core Loop
- Input: rotate a shield ring (arrow keys or touch rotate buttons).
- Action: block incoming void spores from reaching the core seed.
- Reward: wave points and integrity bonus.

### Systems
- Progression: higher waves spawn multi-angle spores.
- Economy: perfect blocks grant extra energy.
- Save/Load: best wave score saved in localStorage.
