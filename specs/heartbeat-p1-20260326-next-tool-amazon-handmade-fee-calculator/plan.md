# Plan — Amazon Handmade Fee Calculator

## Execution plan
1. Confirm the slug is not already shipped in `HEAD` and document why it is a low-overlap exact-match opportunity.
2. Reuse the existing static marketplace-calculator pattern with pure calculation helpers and co-located Node tests.
3. Add small SEO polish (keywords/canonical) rather than broad refactoring.
4. Verify exact-once catalog/discovery wiring.
5. Run syntax, tests, and localhost smoke checks.
6. Record verification, gap analysis, and quality-loop scoring.

## File checklist
- [x] `tools/amazon-handmade-fee-calculator/index.html`
- [x] `tools/amazon-handmade-fee-calculator/calculator.js`
- [x] `tools/amazon-handmade-fee-calculator/calculator.test.js`
- [ ] `specs/heartbeat-p1-20260326-next-tool-amazon-handmade-fee-calculator/verification.md`
- [ ] `specs/heartbeat-p1-20260326-next-tool-amazon-handmade-fee-calculator/gap-analysis.md`
- [ ] `specs/heartbeat-p1-20260326-next-tool-amazon-handmade-fee-calculator/quality-loop.md`

## Verification commands
```bash
cd /Users/kjaylee/.openclaw/workspace/eastsea-blog
node --check tools/amazon-handmade-fee-calculator/calculator.js
node --test tools/amazon-handmade-fee-calculator/calculator.test.js
python3 scripts/tool-catalog-guard.py --root . --fail-on error --max-examples 5
python3 -m http.server 4176 >/tmp/eastsea-amazon-handmade-http.log 2>&1 &
echo $! >/tmp/eastsea-amazon-handmade-http.pid
curl -I http://127.0.0.1:4176/tools/amazon-handmade-fee-calculator/
curl -s http://127.0.0.1:4176/tools/amazon-handmade-fee-calculator/ | grep -E 'Amazon Handmade Fee Calculator|15%|\$0\.30|canonical'
kill "$(cat /tmp/eastsea-amazon-handmade-http.pid)"
```
