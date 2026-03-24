# Verification — Lemon Squeezy Fee Calculator

## Commands run
```bash
cd /Users/kjaylee/.openclaw/workspace/eastsea-blog
node --check tools/lemon-squeezy-fee-calculator/calculator.js
node --test tools/lemon-squeezy-fee-calculator/calculator.test.js

PORT=4174
python3 -m http.server "$PORT" -d . >/tmp/lemon-squeezy-http.log 2>&1 &
SERVER_PID=$!
trap 'kill $SERVER_PID >/dev/null 2>&1 || true' EXIT
sleep 1
curl -I -sS "http://127.0.0.1:${PORT}/tools/lemon-squeezy-fee-calculator/"
curl -sS "http://127.0.0.1:${PORT}/tools/lemon-squeezy-fee-calculator/" | grep -E 'Lemon Squeezy|analytics\\.js|Target list price|Tools' | head

python3 - <<'PY'
import json
from pathlib import Path
root = Path('/Users/kjaylee/.openclaw/workspace/eastsea-blog')
slug = 'lemon-squeezy-fee-calculator'
html = (root/'tools'/'index.html').read_text()
md = (root/'tools'/'index.md').read_text()
man = json.loads((root/'tools'/'manifest.json').read_text())['tools']
items = json.loads((root/'_data'/'tools-list.json').read_text())
print('html_matches', html.count(f'href="{slug}/"'))
print('md_matches', md.count(f'./{slug}/'))
print('manifest_matches', sum(1 for x in man if isinstance(x, dict) and x.get('slug') == slug and x.get('url') == f'/tools/{slug}/'))
print('tools_list_matches', sum(1 for x in items if isinstance(x, dict) and x.get('url') == f'/tools/{slug}/'))
PY
```

## Observed results

### `node --check`
- Passed with no syntax errors in `tools/lemon-squeezy-fee-calculator/calculator.js`.

### `node --test`
Passing output:
```text
✔ TC-LS-01 baseline (card + Stripe US)
✔ TC-LS-02 intl PayPal subscription + PayPal intl payout
✔ TC-LS-03 reverse pricing respects payout regime
✔ TC-LS-04 invalid inputs
✔ negative take-home does not create a negative payout fee credit
✔ TC-LS-05 catalog integration exact-once
✔ summary includes target price and payout mode
ℹ tests 7
ℹ pass 7
ℹ fail 0
```

### Local HTTP smoke
Successful local load evidence:
```text
HTTP/1.0 200 OK
Server: SimpleHTTP/0.6 Python/3.14.3
Content-type: text/html
Content-Length: 12324
```

Marker checks from the served page:
```text
<title>Lemon Squeezy Fee Calculator | Net Revenue, Payout Fees & Target Price</title>
<script src="/assets/analytics.js"></script>
← Tools
Target list price
```

### Catalog / discovery exact-once assertions
```text
html_matches 1
md_matches 1
manifest_matches 1
tools_list_matches 1
```

## Additional deterministic checks
- English-default page includes a Korean toggle (`KR`) in the UI.
- Summary textarea and copy action exist in the page shell and are covered by the exported calculator summary path.
- Payout fee logic is guarded so negative pre-payout proceeds do not create a negative payout-fee credit.

## Commit status
- No commit created in this run.
