# Implementation Plan — p1-games-batch-20260301-2147

## 1) Preflight
- Confirm slugs do not exist.
- Inspect current `games/manifest.json` shape.

## 2) Build Game A (Action)
- Create `games/gyrovine-relay-sprint/index.html`.
- Implement circular player movement, spawn system, collision, score, best-score persistence.
- Add keyboard (←/→, Space, Enter) and touch controls.
- Add Web Audio API beeps for collect/hit/start.
- Create `manifest.webmanifest`.

## 3) Build Game B (Puzzle)
- Create `games/lattice-echo-assembler/index.html`.
- Implement 5x5 board + target board generation.
- Cursor movement and pulse interaction.
- Add stage progression, move counter, best stage persistence.
- Add keyboard + touch buttons and Web Audio feedback.
- Create `manifest.webmanifest`.

## 4) Build Game C (Simulation)
- Create `games/biome-shield-director/index.html`.
- Implement dome state updates and action system with cooldown.
- Add failure/win scoring loops and best-score persistence.
- Add keyboard shortcuts + touch panel.
- Add Web Audio API and mobile responsive HUD.
- Create `manifest.webmanifest`.

## 5) Integrate Catalog
- Prepend 3 entries to `games/manifest.json`.
- Recompute `count`, update `updatedAt`.

## 6) Verification
- JSON parse validation.
- File size check (<500KB each index).
- Checklist QA scoring + gap analysis.
- If score < 90, patch gaps (max 3 iterations).

## 7) Delivery
- Stage only intended files.
- Commit and push with required message pattern.
