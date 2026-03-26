# Verification — YouTube Super Chat Revenue Calculator

## Commands run
```bash
node --check tools/youtube-super-chat-revenue-calculator/calculator.js
node --test tools/youtube-super-chat-revenue-calculator/calculator.test.js

python3 - <<'PY'
import json
from pathlib import Path
root = Path('.')
slug = 'youtube-super-chat-revenue-calculator'
url = f'/tools/{slug}/'
html = (root/'tools'/'index.html').read_text()
md = (root/'tools'/'index.md').read_text()
manifest = json.loads((root/'tools'/'manifest.json').read_text())['tools']
tools_list = json.loads((root/'_data'/'tools-list.json').read_text())
print('index_html_slug_count', html.count(slug))
print('index_md_slug_count', md.count(slug))
print('manifest_slug_count', sum(1 for x in manifest if x.get('slug') == slug and x.get('url') == url))
print('tools_list_url_count', sum(1 for x in tools_list if x.get('url') == url))
print('tool_card_count', html.count('class=\"tool-card\"'))
PY

python3 -m http.server 4175 -d .
```

## Observed results

### `node --check`
- Passed with no syntax errors.

### `node --test`
- Passed.
- `10` tests passed, `0` failed.

### Exact-once discovery checks
```text
index_html_slug_count 1
index_md_slug_count 1
manifest_slug_count 1
tools_list_url_count 1
tool_card_count 675
```

Interpretation:

- the new slug appears exactly once in each required discovery surface
- `tools/index.html` now contains `675` tool cards total after this addition

### Localhost smoke
- Blocked by sandbox network-binding restrictions.
- Exact error:

```text
PermissionError: [Errno 1] Operation not permitted
```

- Because the local HTTP server could not bind a port, browser-style smoke verification was not possible in this environment.

## Final status
- calculator syntax verified
- test suite green
- exact-once discovery verified
- localhost smoke blocked by environment permission error
