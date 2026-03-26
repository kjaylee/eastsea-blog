# Verification: `kdp-royalty-calculator`

## Commands to run
- `node --check tools/kdp-royalty-calculator/calculator.js`
- `node --test tools/kdp-royalty-calculator/calculator.test.js`
- exact-once slug checks via the test suite
- localhost smoke if a static server can be started without extra setup

## Actual results
- `node --check tools/kdp-royalty-calculator/calculator.js`
  - Passed.
- `node --test tools/kdp-royalty-calculator/calculator.test.js`
  - Passed. `11/11` tests green.
- Exact-once slug counts
  - `tools/index.html`: `1`
  - `tools/index.md`: `1`
  - `_data/tools-list.json`: `1`
  - `tools/manifest.json`: `1`
- Localhost smoke
  - Blocked by sandbox networking.
  - Exact blocker:
    - `PermissionError: [Errno 1] Operation not permitted`
    - Triggered by `python3 -m http.server 4173`
