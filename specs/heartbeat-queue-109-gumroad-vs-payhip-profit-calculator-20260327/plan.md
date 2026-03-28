# Plan — queue #109 Gumroad vs Payhip Profit Calculator

## Execution order
1. Freeze scope around the existing `gumroad-vs-payhip-profit-calculator` bundle.
2. Add build-gate docs for research/spec/plan/red-team/test-cases.
3. Extend `calculator.test.js` so it covers:
   - deterministic math
   - HTML anchor presence
   - exact-once discovery by structure
4. Add one discovery card to `tools/index.html`.
5. Add one markdown entry to `tools/index.md`.
6. Add one `_data/tools-list.json` object.
7. Rebuild `tools/manifest.json`.
8. Run syntax checks, test file, structured discovery verification, and localhost smoke.
9. Record verification output.

## Small verifiable slices
### Slice 1 — tests
- Add deterministic HTML/discovery assertions without changing calculator math.

### Slice 2 — discovery
- Add the slug exactly once to the two human-facing indexes and the tools list.

### Slice 3 — manifest
- Rebuild `tools/manifest.json` via `bash scripts/build-manifests.sh`.

### Slice 4 — localhost smoke
- Start a local HTTP server and hit:
  - `http://127.0.0.1:43109/tools/gumroad-vs-payhip-profit-calculator/`

## Verification commands
```bash
node --check tools/gumroad-vs-payhip-profit-calculator/calculator.js
node --check tools/gumroad-vs-payhip-profit-calculator/calculator.test.js
node --test tools/gumroad-vs-payhip-profit-calculator/calculator.test.js
bash scripts/build-manifests.sh
python3 -m http.server 43109 --bind 127.0.0.1
curl -I http://127.0.0.1:43109/tools/gumroad-vs-payhip-profit-calculator/
curl -s http://127.0.0.1:43109/tools/gumroad-vs-payhip-profit-calculator/ | grep -E 'Gumroad vs Payhip Profit Calculator|Best Payhip plan|Gumroad net|Payhip fee calculator'
```

## Surgical edit policy
- No unrelated catalog regeneration beyond the required manifest rebuild
- No edits to other monetization tools
