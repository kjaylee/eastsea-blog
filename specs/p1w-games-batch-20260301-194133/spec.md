# Spec — P1w Games Batch (3)

## Goal
Ship 3 new HTML5 games under `games/{slug}/` and update `games/manifest.json` from count **146 → 149** with new entries prepended.

## Scope
Create the following new slugs (must be unique vs existing `games/`):
1. `stormglass-skiff-runner` (Action)
2. `moonwell-microgrid-warden` (Strategy/Simulation)
3. `sigil-spin-vault` (Puzzle)

Each slug includes:
- `games/{slug}/index.html` (single-file implementation, no external deps)
- `games/{slug}/manifest.webmanifest`

## Gameplay Concepts
### 1) Stormglass Skiff Runner (Action)
- Core loop: steer a skiff across 3 sea lanes, dodge storm shards, collect beacons, and trigger a short phase shield.
- Inputs: keyboard (←/→/A/D + Space) and touch buttons.
- Progression: speed and spawn density increase with distance.

### 2) Moonwell Microgrid Warden (Strategy/Simulation)
- Core loop: keep 3 districts stable by selecting a district and applying one of four operations (charge, cool, route, support).
- Inputs: keyboard (1/2/3 + Q/W/E/R) and touch UI.
- Progression: demand pressure rises every wave; failures can cascade if ignored.

### 3) Sigil Spin Vault (Puzzle)
- Core loop: rotate 3 concentric rings to align required sigils in target windows before move/time budget expires.
- Inputs: keyboard (A/S/D or ←/→ and Enter) and touch controls.
- Progression: more locks, tighter move budgets, and faster timer drain per stage.

## Non-Functional Constraints (Mandatory Checklist)
- Touch + keyboard support.
- Use Web Audio API for SFX.
- Persist best score/round/state via `localStorage`.
- Mobile responsive layout (390x844 baseline) + desktop friendly.
- PWA manifest with `#0a0a1a` theme/background.
- Visual style: neon dark based on `#0a0a1a`.
- `index.html` per game must be < 500KB.
- No external scripts, fonts, assets, or network dependencies.

## Manifest Update Rules
- Prepend 3 new game objects at start of `games` array in `games/manifest.json`.
- Update `count` to 149.
- Update `updatedAt` to current ISO time.
- Include `size` as byte size of each `index.html`.

## Done Criteria
- 3 games playable and restartable.
- Checklist compliance >= 90% for each game.
- Gap analysis documented with iteration scores (max 3 iterations).
- `git commit` + `git push` completed with message:
  - `feat: +3 games (stormglass-skiff-runner, moonwell-microgrid-warden, sigil-spin-vault) — total 149`
