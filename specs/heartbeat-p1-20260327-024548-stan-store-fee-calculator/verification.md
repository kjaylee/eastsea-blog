# Verification — Stan Store Fee Calculator

## Commands run
```bash
node --check tools/stan-store-fee-calculator/calculator.js
node --check tools/stan-store-fee-calculator/calculator.test.js
node --test tools/stan-store-fee-calculator/calculator.test.js
node --test tests/usecase/tool-discovery.test.mjs
```

## Exact-once discovery check
```bash
node - <<'NODE'
const fs = require('fs');
const path = require('path');
const root = process.cwd();
const slug = 'stan-store-fee-calculator';
const url = `/tools/${slug}/`;
const indexHtml = fs.readFileSync(path.join(root, 'tools/index.html'), 'utf8');
const indexMd = fs.readFileSync(path.join(root, 'tools/index.md'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools/manifest.json'), 'utf8'));
const toolsList = JSON.parse(fs.readFileSync(path.join(root, '_data/tools-list.json'), 'utf8'));
console.log(JSON.stringify({
  indexHtmlSlugCount: (indexHtml.match(new RegExp(slug, 'g')) || []).length,
  indexMdSlugCount: (indexMd.match(new RegExp(slug, 'g')) || []).length,
  manifestMatches: manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length,
  toolsListMatches: toolsList.filter((entry) => entry.url === url).length
}, null, 2));
NODE
```

Observed assertions:
- `tools/index.html` slug count = `1`
- `tools/index.md` slug count = `1`
- `_data/tools-list.json` URL count = `1`
- `tools/manifest.json` slug/url pair count = `1`

## Localhost smoke attempt
Attempted:
```bash
python3 -m http.server 8123
```

Result:
- blocked by sandbox socket permissions
- exact error: `PermissionError: [Errno 1] Operation not permitted`

No fake browser verification was recorded after that point.

## Run results
- `node --check tools/stan-store-fee-calculator/calculator.js` → pass
- `node --check tools/stan-store-fee-calculator/calculator.test.js` → pass
- `node --test tools/stan-store-fee-calculator/calculator.test.js` → pass
  - 9 tests passed, 0 failed
- `node --test tests/usecase/tool-discovery.test.mjs` → pass
  - 8 tests passed, 0 failed
- exact-once discovery JSON output:
  - `indexHtmlSlugCount: 1`
  - `indexMdSlugCount: 1`
  - `manifestMatches: 1`
  - `toolsListMatches: 1`
- localhost smoke: blocked by sandbox permission when binding a local port
- Git add / commit: blocked before staging
  - exact blocker: `fatal: Unable to create '/Users/kjaylee/.openclaw/workspace/eastsea-blog/.git/worktrees/eastsea-hb-p1-20260327-024548/index.lock': Operation not permitted`
- Push: not attempted after git metadata write blocker
