# Verification — Memberful Fee Calculator

## Commands run

### 1) JS syntax
```bash
node --check tools/memberful-fee-calculator/calculator.js
```
Result: PASS

### 2) Deterministic tests
```bash
node --test tools/memberful-fee-calculator/calculator.test.js
```
Result: PASS (`12/12`)

### 3) Manifest rebuild
```bash
bash scripts/build-manifests.sh
```
Result:
- `games/manifest.json: 357개`
- `tools/manifest.json: 607개`
- `완료!`

### 4) Catalog exact-once + HTTP smoke
```bash
python3 - <<'PY'
import json
from pathlib import Path
slug='memberful-fee-calculator'
url=f'/tools/{slug}/'
root=Path('/Users/kjaylee/.openclaw/workspace/eastsea-blog')
tools_list=json.loads((root/'_data/tools-list.json').read_text())
manifest=json.loads((root/'tools/manifest.json').read_text())
print('tools-list matches', len([x for x in tools_list if x.get('url')==url]))
print('manifest matches', len([x for x in manifest['tools'] if x.get('slug')==slug and x.get('url')==url]))
print('tools/index.html count', (root/'tools/index.html').read_text().count(slug))
print('tools/index.md count', (root/'tools/index.md').read_text().count(slug))
print('tool dir exists', (root/'tools'/slug).is_dir())
PY
python3 -m http.server 4173 >/tmp/memberful-fee-http.log 2>&1 &
SERVER_PID=$!
sleep 1
curl -I http://127.0.0.1:4173/tools/memberful-fee-calculator/
kill $SERVER_PID
wait $SERVER_PID 2>/dev/null || true
```
Result:
- `tools-list matches 1`
- `manifest matches 1`
- `tools/index.html count 1`
- `tools/index.md count 1`
- `tool dir exists True`
- `HTTP/1.0 200 OK`

## Deterministic numeric spot-checks
- Baseline domestic: Memberful fixed fee `49.00`, Memberful variable fees `245.00`, processor fees `181.00`, take-home `4375.00`, net profit `3775.00`
- Baseline international: processor fees `256.00`, net profit `3700.00`
- Baseline custom `3.7% + 0.45`: processor fees `239.00`, net profit `3717.00`
- Baseline break-even monthly gross: `733.50`
- Baseline target gross for `$1,000` monthly net: `1863.70`
