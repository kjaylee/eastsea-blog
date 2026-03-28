# Plan — Memberstack Fee Calculator

## Execution plan
1. Implement a pure calculator module with public plan constants, cap logic, recommendation logic, and upgrade thresholds.
2. Build a static responsive page with EN/KR labels, assumption copy, KPI cards, detail grid, comparison table, and summary textarea.
3. Wire the slug into EastSea discovery surfaces.
4. Rebuild the tools manifest.
5. Run deterministic unit tests and local HTTP verification.
6. Write verification, gap analysis, and quality-loop artifacts.

## Small verifiable slices
### Slice 1 — math core
- Export public plan constants
- Export billing-mode helpers
- Export processor presets
- Add tests for baseline, yearly-mode comparison, member-cap gating, upgrade thresholds, and invalid inputs
- Verify with:
  ```bash
  node --test tools/memberstack-fee-calculator/calculator.test.js
  ```

### Slice 2 — page shell
- Build a static page with clear pricing-copy anchors and assumption note
- Include billing mode, members, current plan, and custom processor controls
- Verify required strings exist in HTML

### Slice 3 — discovery
- Add exact-once entries to `tools/index.html`, `tools/index.md`, `_data/tools-list.json`
- Rebuild `tools/manifest.json`

### Slice 4 — local serving
- Serve locally and confirm the page loads with the expected metadata and visible copy

## Planned file checklist
- [ ] `tools/memberstack-fee-calculator/index.html`
- [ ] `tools/memberstack-fee-calculator/calculator.js`
- [ ] `tools/memberstack-fee-calculator/calculator.test.js`
- [ ] `tools/index.html`
- [ ] `tools/index.md`
- [ ] `_data/tools-list.json`
- [ ] `tools/manifest.json`
- [ ] `specs/memberstack-fee-calculator-20260327/verification.md`
- [ ] `specs/memberstack-fee-calculator-20260327/gap-analysis.md`
- [ ] `specs/memberstack-fee-calculator-20260327/quality-loop.md`

## Verification commands
```bash
cd /Users/kjaylee/.openclaw/workspace/eastsea-blog
node --test tools/memberstack-fee-calculator/calculator.test.js
bash scripts/build-manifests.sh
python3 -m http.server 4176 >/tmp/eastsea-memberstack-http.log 2>&1 &
echo $! >/tmp/eastsea-memberstack-http.pid
curl -I http://127.0.0.1:4176/tools/memberstack-fee-calculator/
curl -s http://127.0.0.1:4176/tools/memberstack-fee-calculator/ | grep -E 'Memberstack Fee Calculator|Basic|Professional|Business|Established|Yearly 20% OFF|Stripe domestic'
python3 - <<'PY'
from pathlib import Path
checks = [
    ('tools/index.html', 'memberstack-fee-calculator'),
    ('tools/index.md', 'memberstack-fee-calculator'),
    ('_data/tools-list.json', 'memberstack-fee-calculator'),
    ('tools/manifest.json', 'memberstack-fee-calculator'),
]
for file, needle in checks:
    text = Path(file).read_text()
    print(file, text.count(needle))
PY
kill "$(cat /tmp/eastsea-memberstack-http.pid)"
python3 scripts/tool-catalog-guard.py --root . --fail-on error --max-examples 5
```

## 🔴 Red Team
- [공격 1]: This can easily become a clone of existing creator-fee tools without any new decision value.
- [공격 2]: Memberstack pricing is only part of the real payment stack; if Stripe assumptions are hidden, the output can mislead users.
- [공격 3]: Recommendation logic could silently prefer an ineligible low-cost plan if member caps are ignored.
- [방어/완화]:
  - Differentiate on member-cap eligibility plus plan-comparison net profit.
  - Keep Stripe assumptions explicit in both controls and note copy.
  - Enforce eligibility gating in recommendation tests and UI labels.
  - Limit yearly mode to monthly-equivalent planning rather than pretending to model full cash timing.
- [합의]: 🟢극복
