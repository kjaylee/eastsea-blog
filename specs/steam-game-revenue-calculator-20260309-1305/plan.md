# Plan — steam-game-revenue-calculator

1. Confirm current repo state and keep edits limited to the Steam tool and catalog files.
2. Implement `tools/steam-game-revenue-calculator/index.html` as a single static bilingual calculator using the existing App Store / Google Play shell pattern.
3. Add one landing-card entry to `tools/index.html`.
4. Add one descriptive entry to `_data/tools-list.json`.
5. Regenerate `tools/manifest.json` via `bash scripts/build-manifests.sh`.
6. Verify with explicit commands:
   - Node extraction test for `compute(v)` baseline + edge case
   - Local HTTP server + `curl -I` and title/body smoke check
   - `python3 scripts/tool-catalog-guard.py --root . --fail-on error`
7. Write verification outputs to `tmp/steam-game-revenue-calculator-*`.
8. Run the mandatory quality loop: self-score against spec, patch gaps if score < 90, repeat up to 3 rounds.
9. If verification passes, commit only the relevant files inside `eastsea-blog/` with a concise message.
