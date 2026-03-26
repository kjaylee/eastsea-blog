# Plan — Stan Store Fee Calculator

## Execution plan
1. Create the spec bundle and lock the decision for `stan-store-fee-calculator`.
2. Implement a pure calculator module with deterministic exports for plan constants, processor presets, comparison rows, and reverse-price helpers.
3. Build a responsive static page with:
   - plan selector
   - processor selector
   - KPI cards
   - four-row comparison table
   - Creator Pro payback block
   - copyable summary
4. Wire the slug exactly once into:
   - `_data/tools-list.json`
   - `tools/index.html`
   - `tools/index.md`
   - rebuilt `tools/manifest.json`
5. Run `node --check`, `node --test`, exact-once checks, and local HTTP smoke.
6. Score the output in a quality loop and fix anything blocking a `>= 90` score.
7. Commit only task files and report the hash.

## Verification commands
```bash
cd /tmp/eastsea-hb-p1-20260326-232544
node --check tools/stan-store-fee-calculator/calculator.js
node --test tools/stan-store-fee-calculator/calculator.test.js
bash scripts/build-manifests.sh
python3 -m http.server 4174 >/tmp/eastsea-stan-http.log 2>&1 &
echo $! >/tmp/eastsea-stan-http.pid
curl -I http://127.0.0.1:4174/tools/stan-store-fee-calculator/
curl -s http://127.0.0.1:4174/tools/stan-store-fee-calculator/ | grep -E 'Stan Store Fee Calculator|Creator Pro|0% transaction fees'
kill \"$(cat /tmp/eastsea-stan-http.pid)\"
```
