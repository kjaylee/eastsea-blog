# Verification — Sellfy Pricing Calculator

## Commands run

### 1) JS syntax
```bash
node --check tools/sellfy-pricing-calculator/calculator.js
```
Result: PASS

### 2) Deterministic tests
```bash
node --test tools/sellfy-pricing-calculator/calculator.test.js
```
Result: PASS (`13/13`)

### 3) Manifest rebuild
```bash
bash scripts/build-manifests.sh
```
Result:
- `games/manifest.json: 357개`
- `tools/manifest.json: 605개`
- `완료!`

### 4) Catalog exact-once + HTTP smoke
```bash
python3 - <<'PY'
import json
from pathlib import Path
slug='sellfy-pricing-calculator'
url=f'/tools/{slug}/'
tools_list=json.loads(Path('_data/tools-list.json').read_text())
manifest=json.loads(Path('tools/manifest.json').read_text())
print('tools-list matches', len([x for x in tools_list if x.get('url') == url]))
print('manifest matches', len([x for x in manifest['tools'] if x.get('slug') == slug and x.get('url') == url]))
print('tools/index.html count', Path('tools/index.html').read_text().count(slug))
print('tools/index.md count', Path('tools/index.md').read_text().count(slug))
PY
python3 -m http.server 4173 >/tmp/sellfy-pricing-http.log 2>&1 &
SERVER_PID=$!
sleep 1
curl -I http://127.0.0.1:4173/tools/sellfy-pricing-calculator/
kill $SERVER_PID
wait $SERVER_PID 2>/dev/null || true
```
Result:
- `tools-list matches 1`
- `manifest matches 1`
- `tools/index.html count 1`
- `tools/index.md count 1`
- `HTTP/1.0 200 OK`

## Deterministic numeric spot-checks
- Starter annual baseline: subscription `264.00`, processor fees `292.00`, net profit `6344.00`
- Starter annual at `45,000` gross: Business becomes cost-based recommendation
- Starter annual next-plan break-even: `32,200.00`
- Business annual next-plan break-even: `86,000.00`
