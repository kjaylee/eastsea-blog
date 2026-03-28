# Verification — queue #85 upwork-fee-calculator recovery

## Commands
```bash
node --check tools/upwork-fee-calculator/calculator.js
node --check tools/upwork-fee-calculator/calculator.test.js
node --test tools/upwork-fee-calculator/calculator.test.js
python3 - <<'PY'
from pathlib import Path
import json,re
slug='upwork-fee-calculator'; url=f'/tools/{slug}/'
index_html=Path('tools/index.html').read_text()
index_md=Path('tools/index.md').read_text()
manifest=json.loads(Path('tools/manifest.json').read_text())
tools_list=json.loads(Path('_data/tools-list.json').read_text())
print('index.html href count', len(re.findall(r'href="'+re.escape(slug)+r'/"', index_html)))
print('index.md link count', len(re.findall(r'\./'+re.escape(slug)+r'/', index_md)))
print('manifest object count', sum(1 for e in manifest['tools'] if e.get('slug')==slug and e.get('url')==url))
print('tools-list url count', sum(1 for e in tools_list if e.get('url')==url))
PY
python3 -m http.server 43185 --bind 127.0.0.1
curl -I http://127.0.0.1:43185/tools/upwork-fee-calculator/
```

## Results
- `node --check`: pass
- `node --test tools/upwork-fee-calculator/calculator.test.js`: 27/27 pass
- Exact-once structured discovery counts:
  - `tools/index.html`: 1
  - `tools/index.md`: 1
  - `tools/manifest.json`: 1 manifest object (`slug` + `url`)
  - `_data/tools-list.json`: 1 URL entry
- Localhost smoke: `HTTP/1.0 200 OK` for `/tools/upwork-fee-calculator/`
- Page HTML smoke tokens present:
  - title
  - canonical URL
  - `Net to Freelancer`
  - `Reverse (Net → Gross)`
