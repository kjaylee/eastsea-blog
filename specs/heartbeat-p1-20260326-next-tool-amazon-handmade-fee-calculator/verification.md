# Verification — Amazon Handmade Fee Calculator

## Commands run
```bash
cd /Users/kjaylee/.openclaw/workspace/eastsea-blog
node --check tools/amazon-handmade-fee-calculator/calculator.js
node --test tools/amazon-handmade-fee-calculator/calculator.test.js
python3 - <<'PY'
from pathlib import Path
import json
root = Path('.').resolve()
slug = 'amazon-handmade-fee-calculator'
url = f'/tools/{slug}/'
print('index.html', (root/'tools'/'index.html').read_text().count(slug))
print('index.md', (root/'tools'/'index.md').read_text().count(f'./{slug}/'))
print('tools-list', sum(1 for e in json.loads((root/'_data'/'tools-list.json').read_text()) if e.get('url') == url))
print('manifest', sum(1 for e in json.loads((root/'tools'/'manifest.json').read_text())['tools'] if e.get('slug') == slug and e.get('url') == url))
PY
python3 -m http.server 4176 >/tmp/eastsea-amazon-handmade-http.log 2>&1 &
curl -I http://127.0.0.1:4176/tools/amazon-handmade-fee-calculator/
curl -s http://127.0.0.1:4176/tools/amazon-handmade-fee-calculator/ | grep -E 'Amazon Handmade Fee Calculator|15%|\$0\.30|canonical'
kill <pid>
```

## Evidence
### 1) Syntax check
- `node --check tools/amazon-handmade-fee-calculator/calculator.js` → passed with exit code 0.

### 2) Deterministic tests
- `node --test tools/amazon-handmade-fee-calculator/calculator.test.js` → 9/9 tests passed.
- Verified behaviors:
  - baseline order economics
  - optional first-month fee toggle
  - $0.30 minimum-fee floor
  - shipping-in-basis sensitivity
  - invalid-input rejection
  - helper exports
  - defaults validity
  - HTML anchor copy
  - exact-once discovery wiring

### 3) Exact-once catalog/discovery wiring
Targeted counts returned:
- `index.html 1`
- `index.md 1`
- `tools-list 1`
- `manifest 1`

Conclusion: the slug is wired exactly once across the four required discovery surfaces.

### 4) Localhost smoke check
- `curl -I http://127.0.0.1:4176/tools/amazon-handmade-fee-calculator/` → `HTTP/1.0 200 OK`
- Body grep confirmed these live tokens in served HTML:
  - `Amazon Handmade Fee Calculator`
  - `15% of the buyer charge basis or $0.30 minimum`
  - canonical link to `https://eastsea.monster/tools/amazon-handmade-fee-calculator/`
  - keywords meta containing `amazon handmade fee calculator`

## Note on repo-wide catalog guard
- `python3 scripts/tool-catalog-guard.py --root . --fail-on error --max-examples 5` currently fails on many **pre-existing repo-wide** `_data/tools-list.json` coverage issues unrelated to this slug.
- This task therefore used a slug-scoped exact-once verification instead of claiming the entire repository catalog is clean.
