# Plan — Lemon Squeezy Fee Calculator

## Phase 0 — precheck
1. Confirm slug is absent from:
   - `eastsea-blog/tools/lemon-squeezy-fee-calculator/`
   - `eastsea-blog/tools/index.html`
   - `eastsea-blog/tools/index.md`
   - `eastsea-blog/tools/manifest.json`
   - `eastsea-blog/_data/tools-list.json`
2. Reuse structural ideas from:
   - `tools/gumroad-net-revenue-calculator/`
   - `tools/paypal-fee-calculator/`

## Phase 1 — implementation
1. Build `calculator.js`
   - deterministic pure calculation API
   - Node export + browser init
   - bilingual copy + summary builder
   - forward calculation + reverse target pricing
2. Build `index.html`
   - responsive single-page UI
   - grouped fee inputs
   - KPI cards, detail table, summary textarea, notes, language toggle
3. Build `calculator.test.js`
   - baseline domestic card / Stripe US case
   - international PayPal subscription / PayPal intl payout case
   - reverse target list price case
   - invalid input cases
   - catalog integration assertions

## Phase 2 — discovery wiring
1. Add one card entry in `tools/index.html`
2. Add one markdown entry in `tools/index.md`
3. Add one manifest entry in `tools/manifest.json`
4. Add one `_data/tools-list.json` entry

## Phase 3 — verification
Run exactly:
```bash
node --check /Users/kjaylee/.openclaw/workspace/eastsea-blog/tools/lemon-squeezy-fee-calculator/calculator.js
node --test /Users/kjaylee/.openclaw/workspace/eastsea-blog/tools/lemon-squeezy-fee-calculator/calculator.test.js
python3 -m http.server 4173 -d /Users/kjaylee/.openclaw/workspace/eastsea-blog >/tmp/lemon-squeezy-tool-http.log 2>&1 & echo $! >/tmp/lemon-squeezy-tool-http.pid
curl -fsS http://127.0.0.1:4173/tools/lemon-squeezy-fee-calculator/ | grep -E 'Lemon Squeezy|analytics.js|target price|Tools'
python3 - <<'PY'
import json
from pathlib import Path
root = Path('/Users/kjaylee/.openclaw/workspace/eastsea-blog')
slug = 'lemon-squeezy-fee-calculator'
html = (root/'tools'/'index.html').read_text()
md = (root/'tools'/'index.md').read_text()
manifest = json.loads((root/'tools'/'manifest.json').read_text())['tools']
items = json.loads((root/'_data'/'tools-list.json').read_text())
print('html_matches', html.count(f'href="{slug}/"'))
print('md_matches', md.count(f'./{slug}/'))
print('manifest_matches', sum(1 for x in manifest if isinstance(x, dict) and x.get('slug') == slug and x.get('url') == f'/tools/{slug}/'))
print('tools_list_matches', sum(1 for x in items if isinstance(x, dict) and x.get('url') == f'/tools/{slug}/'))
PY
kill "$(cat /tmp/lemon-squeezy-tool-http.pid)"
```

## Phase 4 — quality loop
1. Score implementation against `spec.md` and `test-cases.md`
2. If score < 90, fix gaps immediately
3. Re-run verification after fixes
4. Write `gap-analysis.md` and `quality-loop.md`
5. Commit only if verification passes and repo changes are limited to intended files
