# Plan — Gumroad Net Revenue Calculator

## Execution plan
1. Create spec artifacts first and lock math/validation.
2. Implement a standalone calculator module with exported pure functions.
3. Build a lightweight bilingual static page that consumes the module.
4. Add catalog metadata only where missing (`_data/tools-list.json`, `tools/manifest.json`).
5. Run deterministic tests and local HTTP verification.
6. Write verification, gap analysis, and quality-loop artifacts.

## File checklist
- [ ] `tools/gumroad-net-revenue-calculator/index.html`
- [ ] `tools/gumroad-net-revenue-calculator/calculator.js`
- [ ] `tools/gumroad-net-revenue-calculator/calculator.test.js`
- [ ] `_data/tools-list.json`
- [ ] `tools/manifest.json`
- [ ] `specs/heartbeat-p1-20260325-gumroad-net-revenue-calculator/verification.md`
- [ ] `specs/heartbeat-p1-20260325-gumroad-net-revenue-calculator/gap-analysis.md`
- [ ] `specs/heartbeat-p1-20260325-gumroad-net-revenue-calculator/quality-loop.md`

## Verification commands
```bash
cd /Users/kjaylee/.openclaw/workspace/eastsea-blog
node --test tools/gumroad-net-revenue-calculator/calculator.test.js
python3 -m http.server 4173 >/tmp/eastsea-gumroad-http.log 2>&1 &
echo $! >/tmp/eastsea-gumroad-http.pid
curl -I http://127.0.0.1:4173/tools/gumroad-net-revenue-calculator/
curl -s http://127.0.0.1:4173/tools/gumroad-net-revenue-calculator/ | grep -E 'Gumroad Net Revenue Calculator|10% \+ \$0\.50|30%'
kill "$(cat /tmp/eastsea-gumroad-http.pid)"
```

## 🔴 Red Team
- [공격 1]: Gumroad fee copy may be stale, especially around merchant-of-record handling or processing assumptions.
- [공격 2]: Existing catalog entries might already point to a different intended slug/title, causing metadata duplication or mismatch.
- [공격 3]: Adding processor presets could falsely imply they are official Gumroad fees.
- [방어/완화]: Use only official Gumroad pricing for platform-fee math; clearly label processor fees as user assumptions; keep slug/title aligned to the already-linked discovery card; enforce exact-once discovery tests.
- [합의]: 🟢극복
