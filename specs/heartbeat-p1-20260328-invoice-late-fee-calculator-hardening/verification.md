# Verification — Invoice Late Fee Calculator Hardening

## Commands run
```bash
node --check tools/invoice-late-fee-calculator/calculator.js
node --test tools/invoice-late-fee-calculator/calculator.test.js
bash scripts/build-manifests.sh
python3 - <<'PY'
import json
from pathlib import Path
slug='invoice-late-fee-calculator'
url=f'/tools/{slug}/'
tools_list=json.loads(Path('_data/tools-list.json').read_text(encoding='utf-8'))
manifest=json.loads(Path('tools/manifest.json').read_text(encoding='utf-8'))
index_md=Path('tools/index.md').read_text(encoding='utf-8')
print('tools-list matches', len([x for x in tools_list if x.get('url') == url]))
print('manifest matches', len([x for x in manifest['tools'] if x.get('slug') == slug and x.get('url') == url]))
print('index.md matches', index_md.count(f'./{slug}/'))
PY
python3 -m http.server 4173 & curl -I http://127.0.0.1:4173/tools/invoice-late-fee-calculator/
```

## Results
- `node --check`: pass
- `node --test`: pass (`8/8`)
- manifest rebuild: pass (`tools/manifest.json: 726개`)
- catalog exact-once:
  - `tools-list matches 1`
  - `manifest matches 1`
  - `index.md matches 1`
- local HTTP smoke: `200 OK`

## Files delivered
- `tools/invoice-late-fee-calculator/index.html`
- `tools/invoice-late-fee-calculator/calculator.js`
- `tools/invoice-late-fee-calculator/calculator.test.js`
- `_data/tools-list.json`
- `tools/index.md`
- `tools/manifest.json`
