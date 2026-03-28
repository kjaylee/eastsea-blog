# Plan — Amazon KDP Royalty Calculator

## Execution plan
1. Create the build-gate artifacts first (research/spec/plan/red-team/test-cases).
2. Implement pure royalty logic in `logic.mjs`.
3. Implement a responsive static UI in `index.html` + `app.mjs`.
4. Wire the tool into the catalog exactly once.
5. Rebuild `tools/manifest.json` with the repo script.
6. Run unit + manifest verification + local HTTP checks.
7. Write verification, gap analysis, and quality-loop artifacts.

## File checklist
- [ ] `tools/amazon-kdp-royalty-calculator/index.html`
- [ ] `tools/amazon-kdp-royalty-calculator/logic.mjs`
- [ ] `tools/amazon-kdp-royalty-calculator/app.mjs`
- [ ] `tests/unit/amazon-kdp-royalty-calculator.test.mjs`
- [ ] `tools/index.html`
- [ ] `tools/index.md`
- [ ] `_data/tools-list.json`
- [ ] `tools/manifest.json`
- [ ] `specs/tool-mass-production-2026-03-28-amazon-kdp-royalty-calculator/verification.md`
- [ ] `specs/tool-mass-production-2026-03-28-amazon-kdp-royalty-calculator/gap-analysis.md`
- [ ] `specs/tool-mass-production-2026-03-28-amazon-kdp-royalty-calculator/quality-loop.md`

## Verification commands
```bash
cd /Users/kjaylee/.openclaw/workspace/eastsea-blog
bash scripts/build-manifests.sh
node --test tests/unit/amazon-kdp-royalty-calculator.test.mjs tests/integration/manifest-integrity.test.mjs
python3 -m http.server 4173 >/tmp/eastsea-kdp-http.log 2>&1 &
echo $! >/tmp/eastsea-kdp-http.pid
curl -I http://127.0.0.1:4173/tools/amazon-kdp-royalty-calculator/
curl -s http://127.0.0.1:4173/tools/amazon-kdp-royalty-calculator/ | grep -E 'Amazon KDP Royalty Calculator|35%|70%|60%|Expanded Distribution'
kill "$(cat /tmp/eastsea-kdp-http.pid)"
```

## Risks
- Official KDP pricing nuances can drift, especially 70%-plan eligibility constraints.
- Printing-cost math is incomplete without user-supplied KDP print cost.
- Catalog edits can accidentally duplicate entries if inserted manually.

## Mitigation
- Limit formulas to explicit public rules only.
- Require manual printing-cost input.
- Add exact-once catalog wiring tests.
