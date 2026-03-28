# Verification — Contribution Margin Calculator

## Commands run

### 1. Syntax check
Command:
```bash
node --check tools/contribution-margin-calculator/calculator.js
```

Result:
- Exit code `0`
- No output

### 2. Manifest rebuild
Command:
```bash
bash scripts/build-manifests.sh
```

Output:
```text
games/manifest.json: 358개
tools/manifest.json: 734개
완료!
```

### 3. Deterministic automated test
Command:
```bash
node --test tools/contribution-margin-calculator/calculator.test.js
```

Output:
```text
✔ TC-CM-00 exports defaults and examples (0.849167ms)
✔ TC-CM-01 baseline profitable unit economics (13.108542ms)
✔ TC-CM-02 exact break-even denominator with rounding up (0.221917ms)
✔ TC-CM-03 omitted target profit defaults to zero (0.208167ms)
✔ TC-CM-04 zero fixed costs keeps break-even at zero when unit economics are viable (0.19475ms)
✔ TC-CM-05 non-viable unit economics return null thresholds (0.21575ms)
✔ TC-CM-06 invalid input validation rejects bad values (0.106708ms)
✔ TC-CM-07 summary output includes decision-ready fields (0.209792ms)
✔ TC-CM-08 html contains formulas, examples, and copy summary UI (0.271083ms)
✔ TC-CM-09 discovery exact-once wiring (4.210792ms)
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 114.607709
```

### 4. Discovery exact-once check
Command:
```bash
python3 - <<'PY'
import json
from pathlib import Path
root = Path('.')
slug = 'contribution-margin-calculator'
url = f'/tools/{slug}/'
index_html = (root / 'tools' / 'index.html').read_text(encoding='utf-8')
index_md = (root / 'tools' / 'index.md').read_text(encoding='utf-8')
manifest = json.loads((root / 'tools' / 'manifest.json').read_text(encoding='utf-8'))
tools_list = json.loads((root / '_data' / 'tools-list.json').read_text(encoding='utf-8'))
print({
  'index_html_count': index_html.count(slug),
  'index_md_count': index_md.count(slug),
  'manifest_count': sum(1 for item in manifest['tools'] if item['slug'] == slug and item['url'] == url),
  'tools_list_count': sum(1 for item in tools_list if item['url'] == url),
  'manifest_tools_total': manifest['count']
})
PY
```

Output:
```text
{'index_html_count': 1, 'index_md_count': 1, 'manifest_count': 1, 'tools_list_count': 1, 'manifest_tools_total': 734}
```

## Notes
- `scripts/build-manifests.sh` updates both `tools/manifest.json` and `games/manifest.json`; that is expected behavior in this repo.
- During the implementation loop, one test expectation for ratio precision was corrected to match the calculator’s exported 4-decimal rounding contract. Final verification above is the post-fix run.
