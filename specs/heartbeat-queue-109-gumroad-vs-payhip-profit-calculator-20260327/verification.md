# Verification — queue #109 Gumroad vs Payhip Profit Calculator

Date: 2026-03-27

## Commands run
```bash
node --check tools/gumroad-vs-payhip-profit-calculator/calculator.js
node --check tools/gumroad-vs-payhip-profit-calculator/calculator.test.js
bash scripts/build-manifests.sh
node --test tools/gumroad-vs-payhip-profit-calculator/calculator.test.js
python3 - <<'PY'
from pathlib import Path
import json,re
slug='gumroad-vs-payhip-profit-calculator'; url=f'/tools/{slug}/'
index_html=Path('tools/index.html').read_text()
index_md=Path('tools/index.md').read_text()
manifest=json.loads(Path('tools/manifest.json').read_text())
tools_list=json.loads(Path('_data/tools-list.json').read_text())
print('index.html slug count', len(re.findall(re.escape(slug), index_html)))
print('index.md slug count', len(re.findall(re.escape(slug), index_md)))
print('manifest object count', sum(1 for e in manifest['tools'] if e.get('slug')==slug and e.get('url')==url))
print('tools-list url count', sum(1 for e in tools_list if e.get('url')==url))
PY
python3 -m http.server 43109 --bind 127.0.0.1
curl -I http://127.0.0.1:43109/tools/gumroad-vs-payhip-profit-calculator/
```

## Results
- `node --check tools/gumroad-vs-payhip-profit-calculator/calculator.js`: pass
- `node --check tools/gumroad-vs-payhip-profit-calculator/calculator.test.js`: pass
- `bash scripts/build-manifests.sh`: pass
  - `games/manifest.json: 358개`
  - `tools/manifest.json: 721개`
- `node --test tools/gumroad-vs-payhip-profit-calculator/calculator.test.js`: pass
  - `9/9` tests passed
  - Includes exact-match HTML anchors
  - Includes exact-once discovery wiring

## Structured discovery counts
- `tools/index.html`: `1`
- `tools/index.md`: `1`
- `tools/manifest.json`: `1`
- `_data/tools-list.json`: `1`

## Localhost smoke
- Exact command attempted:
  - `python3 -m http.server 43109 --bind 127.0.0.1`
- Result:
  - `PermissionError: [Errno 1] Operation not permitted`
- Follow-up command:
  - `curl -I http://127.0.0.1:43109/tools/gumroad-vs-payhip-profit-calculator/`
- Follow-up result:
  - `curl: (7) Failed to connect to 127.0.0.1 port 43109 after 0 ms: Couldn't connect to server`

## Conclusion
- Tool math and build-gate tests: verified
- Exact-once discovery wiring: verified
- Localhost smoke: not verifiable in this sandbox because bind is blocked
