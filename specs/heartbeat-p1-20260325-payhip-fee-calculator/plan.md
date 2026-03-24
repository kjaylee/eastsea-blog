# Plan — Payhip Fee Calculator

## Execution plan
1. Preserve the already-linked discovery slug and backfill the missing filesystem tool.
2. Implement a pure calculator module with exported plan/preset constants and deterministic math helpers.
3. Build a single static page with responsive layout, processor notes, KPI cards, comparison table, and copyable summary.
4. Rebuild `tools/manifest.json` so the slug becomes truly shipped.
5. Run deterministic tests plus local HTTP verification.
6. Write verification, gap analysis, and quality-loop artifacts.

## File checklist
- [ ] `tools/payhip-fee-calculator/index.html`
- [ ] `tools/payhip-fee-calculator/calculator.js`
- [ ] `tools/payhip-fee-calculator/calculator.test.js`
- [ ] `tools/manifest.json`
- [ ] `specs/heartbeat-p1-20260325-payhip-fee-calculator/verification.md`
- [ ] `specs/heartbeat-p1-20260325-payhip-fee-calculator/gap-analysis.md`
- [ ] `specs/heartbeat-p1-20260325-payhip-fee-calculator/quality-loop.md`

## Verification commands
```bash
cd /Users/kjaylee/.openclaw/workspace/eastsea-blog
node --test tools/payhip-fee-calculator/calculator.test.js
bash scripts/build-manifests.sh
python3 -m http.server 4174 >/tmp/eastsea-payhip-http.log 2>&1 &
echo $! >/tmp/eastsea-payhip-http.pid
curl -I http://127.0.0.1:4174/tools/payhip-fee-calculator/
curl -s http://127.0.0.1:4174/tools/payhip-fee-calculator/ | grep -E 'Payhip Fee Calculator|Free|Plus|Pro|5%|2%|0%'
kill "$(cat /tmp/eastsea-payhip-http.pid)"
python3 scripts/tool-catalog-guard.py --root . --fail-on error --max-examples 5
```
