# Verification — Stan Store Fee Calculator

## Commands run
```bash
cd /tmp/eastsea-hb-p1-20260326-232544
node --check tools/stan-store-fee-calculator/calculator.js
node --check tools/stan-store-fee-calculator/calculator.test.js
bash scripts/build-manifests.sh
node --test tools/stan-store-fee-calculator/calculator.test.js
node - <<'NODE'
const fs = require('node:fs');
const path = require('node:path');
const root = process.cwd();
const slug = 'stan-store-fee-calculator';
const url = `/tools/${slug}/`;
const indexHtml = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
const indexMd = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
const toolsList = JSON.parse(fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));
console.log({
  indexHtml: (indexHtml.match(new RegExp(slug, 'g')) || []).length,
  indexMd: (indexMd.match(new RegExp(slug, 'g')) || []).length,
  toolsList: toolsList.filter((entry) => entry.url === url).length,
  manifest: manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length
});
NODE
python3 -m http.server 4174
```

## Results
### JS syntax
- `node --check tools/stan-store-fee-calculator/calculator.js` → pass
- `node --check tools/stan-store-fee-calculator/calculator.test.js` → pass

### Node tests
- `node --test tools/stan-store-fee-calculator/calculator.test.js` → `12/12` passing
- Covered areas:
  - baseline math
  - annual-vs-monthly delta
  - Creator Pro payback math
  - custom processor override
  - validation
  - null reverse-math edge case
  - summary text
  - HTML anchors
  - exact-once discovery wiring

### Manifest rebuild
- `bash scripts/build-manifests.sh` → pass
- Output confirmed:
  - `tools/manifest.json: 690개`
- New manifest entry exists for:
  - `slug: stan-store-fee-calculator`
  - `url: /tools/stan-store-fee-calculator/`

### Exact-once slug counts
- `tools/index.html` → `1`
- `tools/index.md` → `1`
- `_data/tools-list.json` → `1`
- `tools/manifest.json` → `1`

### Landing-page count note
- `tools/index.html` now contains `675` actual `.tool-card` entries.
- Metadata and structured-data counts in that file were updated to `675` to match the current public card surface.
- This remains intentionally distinct from `tools/manifest.json` count `690`, which reflects all shipped tool directories.

### Local HTTP smoke
- Attempted `python3 -m http.server 4174` from the repo root.
- Result: blocked by local bind permissions.
- Observed error:
  - `PermissionError: [Errno 1] Operation not permitted`
- Conclusion:
  - localhost smoke could not be completed in this environment.
  - This limitation is environmental, not specific to the Stan tool files.

## Conclusion
- The Stan tool ships cleanly with passing JS syntax, passing deterministic tests, rebuilt manifest coverage, and exact-once discovery wiring.
- Localhost bind remains blocked and is recorded as an explicit verification limit.
