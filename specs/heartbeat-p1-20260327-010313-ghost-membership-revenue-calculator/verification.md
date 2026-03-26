# Verification

## Required Checks
- `node --check tools/ghost-membership-revenue-calculator/calculator.js`
- `node --check tools/ghost-membership-revenue-calculator/index.html` is not applicable because HTML is not a Node script
- `node --test tools/ghost-membership-revenue-calculator/calculator.test.js`
- exact-once slug count checks across required discovery files
- localhost smoke if possible

## Status
- `node --check tools/ghost-membership-revenue-calculator/calculator.js` ✅
- `node --check tools/ghost-membership-revenue-calculator/calculator.test.js` ✅
- `node --test tools/ghost-membership-revenue-calculator/calculator.test.js` ✅ `8/8` passing
- exact-once slug counts ✅
  - `tools/index.html`: `1`
  - `tools/index.md`: `1`
  - `_data/tools-list.json`: `1`
  - `tools/manifest.json`: `1`
- localhost smoke ⛔ blocked by sandbox
  - Exact blocker: `PermissionError: [Errno 1] Operation not permitted` when attempting `python3 -m http.server 8123`
