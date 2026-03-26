# Verification

## Commands Run

```bash
node --check tools/udemy-instructor-revenue-calculator/calculator.js
node --test tools/udemy-instructor-revenue-calculator/calculator.test.js
rg -o 'udemy-instructor-revenue-calculator' tools/index.html | wc -l
rg -o 'udemy-instructor-revenue-calculator' tools/index.md | wc -l
rg -o '/tools/udemy-instructor-revenue-calculator/' _data/tools-list.json | wc -l
rg -o '"slug": "udemy-instructor-revenue-calculator"' tools/manifest.json | wc -l
```

## Results

- `node --check tools/udemy-instructor-revenue-calculator/calculator.js` ✅
- `node --test tools/udemy-instructor-revenue-calculator/calculator.test.js` ✅
  - 8 tests passed
- exact-once counts ✅
  - `tools/index.html`: 1
  - `tools/index.md`: 1
  - `_data/tools-list.json`: 1
  - `tools/manifest.json`: 1

## Local Smoke

Attempted but blocked by sandbox restrictions:

- `python3 -m http.server 4173` failed with `PermissionError: [Errno 1] Operation not permitted` while binding the port.
- A fallback file-based Playwright smoke also failed because Chromium could not launch in this environment (`bootstrap_check_in ... Permission denied (1100)`).

Conclusion:

- Unit and static verification passed.
- Browser / localhost smoke could not be completed due environment permissions, not due a detected tool failure.
