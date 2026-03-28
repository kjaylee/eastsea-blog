# Plan — ThriveCart vs SamCart Cost Calculator

## Execution plan
1. Create mandatory build-gate artifacts (research/spec/plan/red-team/test-cases).
2. Implement pure comparison logic in `logic.mjs`.
3. Build a responsive static page in `index.html` + `app.mjs`.
4. Add exact-once discovery entries in `tools/index.html`, `tools/index.md`, and `_data/tools-list.json`.
5. Rebuild `tools/manifest.json` via `bash scripts/build-manifests.sh`.
6. Run unit tests and local HTTP smoke checks.
7. Write verification, gap-analysis, and quality-loop artifacts.

## File checklist
- [ ] `tools/thrivecart-vs-samcart-cost-calculator/index.html`
- [ ] `tools/thrivecart-vs-samcart-cost-calculator/logic.mjs`
- [ ] `tools/thrivecart-vs-samcart-cost-calculator/app.mjs`
- [ ] `tests/unit/thrivecart-vs-samcart-cost-calculator.test.mjs`
- [ ] `tools/index.html`
- [ ] `tools/index.md`
- [ ] `_data/tools-list.json`
- [ ] `tools/manifest.json`
- [ ] `specs/heartbeat-p1-tool-20260329d-thrivecart-vs-samcart-cost-calculator/verification.md`
- [ ] `specs/heartbeat-p1-tool-20260329d-thrivecart-vs-samcart-cost-calculator/gap-analysis.md`
- [ ] `specs/heartbeat-p1-tool-20260329d-thrivecart-vs-samcart-cost-calculator/quality-loop.md`

## Verification commands
```bash
cd /Users/kjaylee/.openclaw/workspace/eastsea-blog
node --check tools/thrivecart-vs-samcart-cost-calculator/app.mjs
node --check tools/thrivecart-vs-samcart-cost-calculator/logic.mjs
node --test tests/unit/thrivecart-vs-samcart-cost-calculator.test.mjs
bash scripts/build-manifests.sh
python3 -m http.server 4173 >/tmp/eastsea-thrivecart-http.log 2>&1 &
echo $! >/tmp/eastsea-thrivecart-http.pid
curl -I http://127.0.0.1:4173/tools/thrivecart-vs-samcart-cost-calculator/
curl -s http://127.0.0.1:4173/tools/thrivecart-vs-samcart-cost-calculator/ | grep -E 'ThriveCart vs SamCart Cost Calculator|one-time|monthly|break-even'
kill "$(cat /tmp/eastsea-thrivecart-http.pid)"
```

## Risks
- ThriveCart live pricing is not fully exposed in official fetched HTML.
- SamCart revenue-tier step pricing is incomplete in the fetched public snapshot.
- Catalog files are currently dirty from parallel work, so manual edits can accidentally collide.

## Mitigation
- Treat ThriveCart upfront price as an editable market-observed example.
- Keep SamCart growth surcharge editable instead of pretending to know every tier.
- Make surgical catalog edits and commit only this tool’s files.
- Verify exact-once wiring with tests.