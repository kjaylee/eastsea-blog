# Plan — Thinkific Fee Calculator

## Execution plan
1. Lock the formula scope to the researched public-plan and published-fee rules only.
2. Implement a pure calculator module with exported plan constants, preset defaults, cap logic, and validation.
3. Build a static responsive page with inputs, KPI cards, detail rows, comparison table, and copyable summary.
4. Wire the slug into EastSea discovery surfaces.
5. Rebuild the manifest.
6. Run deterministic tests plus local HTTP verification.
7. Write verification, gap-analysis, and quality-loop artifacts.

## Small verifiable slices
### Slice 1 — math core
- Export plan-cost constants for Basic / Start / Grow
- Export extra gateway-fee constants and `$1M` cap logic
- Export processor preset defaults
- Add tests for baseline, cap-crossing, and validation behavior
- Verify with:
  ```bash
  node --test tools/thinkific-fee-calculator/calculator.test.js
  ```

### Slice 2 — page shell
- Build a polished static page with clear fee assumptions
- Include controls for payment setup, processor preset, recurring toggle, tax toggle, and YTD cap progress
- Verify signature strings exist in HTML

### Slice 3 — discovery
- Add exact-once entries to `tools/index.html`, `tools/index.md`, and `_data/tools-list.json`
- Rebuild `tools/manifest.json`
- Verify slug presence exactly once in each surface

### Slice 4 — local serving
- Serve locally and confirm the page loads with the expected metadata and visible copy

## Planned file checklist
- [ ] `tools/thinkific-fee-calculator/index.html`
- [ ] `tools/thinkific-fee-calculator/calculator.js`
- [ ] `tools/thinkific-fee-calculator/calculator.test.js`
- [ ] `tools/index.html`
- [ ] `tools/index.md`
- [ ] `_data/tools-list.json`
- [ ] `tools/manifest.json`
- [ ] `specs/thinkific-fee-calculator-20260327/verification.md`
- [ ] `specs/thinkific-fee-calculator-20260327/gap-analysis.md`
- [ ] `specs/thinkific-fee-calculator-20260327/quality-loop.md`

## Verification commands
```bash
cd /Users/kjaylee/.openclaw/workspace/eastsea-blog
node --test tools/thinkific-fee-calculator/calculator.test.js
bash scripts/build-manifests.sh
python3 -m http.server 4175 >/tmp/eastsea-thinkific-http.log 2>&1 &
echo $! >/tmp/eastsea-thinkific-http.pid
curl -I http://127.0.0.1:4175/tools/thinkific-fee-calculator/
curl -s http://127.0.0.1:4175/tools/thinkific-fee-calculator/ | grep -E 'Thinkific Fee Calculator|Basic|Start|Grow|\$1,000,000|third-party gateway|Thinkific Payments'
python3 - <<'PY'
from pathlib import Path
checks = [
    ('tools/index.html', 'thinkific-fee-calculator'),
    ('tools/index.md', 'thinkific-fee-calculator'),
    ('_data/tools-list.json', '/tools/thinkific-fee-calculator/'),
    ('tools/manifest.json', 'thinkific-fee-calculator'),
]
for file, needle in checks:
    text = Path(file).read_text()
    print(file, text.count(needle))
PY
kill "$(cat /tmp/eastsea-thinkific-http.pid)"
python3 scripts/tool-catalog-guard.py --root . --fail-on error --max-examples 5
```

## Decision notes
- Keep v1 card-first. Do not try to model every Thinkific Payments payment method on day one.
- Preserve a custom-rate override so the tool remains useful outside US defaults.
- Make the `$1M` extra-fee cap visible; this is the strongest differentiation from generic creator fee calculators.

## 🔴 Red Team
- [공격 1]: Thinkific Payments fees vary by country, payment method, and payment type. If v1 pretends to be universal, it will be wrong often enough to hurt trust.
- [공격 2]: The catalog already has several course / creator platform fee tools. If this ships as a generic clone, it adds clutter instead of compounding search coverage.
- [공격 3]: The `$1M` annual cap logic is easy to implement incorrectly, especially when a month partially crosses the cap.
- [방어/완화]:
  - Scope v1 to public plans and card-first defaults, with custom override and explicit assumption copy.
  - Differentiate on Thinkific-specific economics: extra third-party gateway fee plus cap-aware thresholds.
  - Test three cap states explicitly: below cap, crossing cap mid-period, and already above cap.
  - Keep Plus / custom-quote plans out of the default comparison until public pricing is available.
- [합의]: 🟢극복
