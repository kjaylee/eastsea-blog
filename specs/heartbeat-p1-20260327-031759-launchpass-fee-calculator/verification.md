# Verification — LaunchPass Fee Calculator

## Planned commands

### 1) Syntax checks
```bash
node --check tools/launchpass-fee-calculator/calculator.js
node --check tools/launchpass-fee-calculator/calculator.test.js
```

### 2) Tool tests
```bash
node --test tools/launchpass-fee-calculator/calculator.test.js
```

### 3) Exact-once slug counts
```bash
node - <<'NODE'
const fs = require('node:fs');
const slug = 'launchpass-fee-calculator';
for (const file of ['tools/index.html', 'tools/index.md']) {
  const text = fs.readFileSync(file, 'utf8');
  console.log(file, (text.match(new RegExp(slug, 'g')) || []).length);
}
const list = JSON.parse(fs.readFileSync('_data/tools-list.json', 'utf8'));
console.log('_data/tools-list.json', list.filter((entry) => entry.url === `/tools/${slug}/`).length);
const manifest = JSON.parse(fs.readFileSync('tools/manifest.json', 'utf8'));
console.log('tools/manifest.json', manifest.tools.filter((entry) => entry.slug === slug).length);
NODE
```

### 4) Localhost smoke
```bash
python3 -m http.server 4317
curl -s http://127.0.0.1:4317/tools/launchpass-fee-calculator/ | rg '<title>'
```

## Result

### 1) Syntax checks
- `node --check tools/launchpass-fee-calculator/calculator.js` → pass
- `node --check tools/launchpass-fee-calculator/calculator.test.js` → pass

### 2) Tool tests
```bash
node --test tools/launchpass-fee-calculator/calculator.test.js
```

Result:
- 11 tests passed
- 0 failed

Covered:
- golden default math
- refund sensitivity
- international vs domestic processor presets
- custom processor override
- invalid contribution-margin handling
- invalid input rejection
- HTML scaffold anchors
- exact-once discovery wiring

### 3) Exact-once slug counts
- `tools/index.html` → `1`
- `tools/index.md` → `1`
- `_data/tools-list.json` → `1`
- `tools/manifest.json` → `1`

### 4) Localhost smoke
- Attempted `python3 -m http.server 4317`
- Blocked by sandbox with:
  - `PermissionError: [Errno 1] Operation not permitted`

Fallback evidence:
- `calculator.test.js` confirms the HTML title and required script anchors from disk.

## Verification verdict
Pass with one recorded environment blocker:
- localhost bind is not permitted in this sandbox, so HTTP smoke could not be completed here.
