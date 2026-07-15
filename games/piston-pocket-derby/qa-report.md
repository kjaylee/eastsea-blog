# Piston Pocket Derby QA Report

Date: 2026-07-16 KST

## Result

- Browser viewport: 390×844
- Built-in QA: `window.__qaResult.pass === true`
- Assertions: 13/13 pass
- Implemented wow factors: 5
- JavaScript page errors: 0
- Rendered `undefined` / `NaN`: 0
- Layout: 390px document width, no horizontal overflow
- Input safety: `touch-action: none`

## Gameplay Evidence

- Two distinct pointer ids held the left and right pistons independently.
- Releasing both sides within 140ms produced `twinLaunches=1`, negative vertical velocity, and neutralized angular velocity.
- Pit Bench Draft changed runtime spring/build state.
- Blueprint Finish Freeze displayed the result card.
- Retry returned to `mode=play` with `worldX=0`.
- localStorage stored best score, run count, daily score, medal, and best Perfect chain.

## Static Evidence

- Inline JavaScript passed `node --check`.
- `games-list.json` passed JSON parsing and contains exactly one `piston-pocket-derby` entry.
- `git diff --check` passed.
- Local HTTP server returned 200 and the expected title.

## Remaining Risk

Physical-device multi-touch was not tested. Pointer capture, `touch-action:none`, and keyboard fallback reduce the risk.
