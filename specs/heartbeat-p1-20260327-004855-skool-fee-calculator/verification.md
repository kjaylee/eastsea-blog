# Verification

## Passed

- `node --check tools/skool-fee-calculator/calculator.js`
- `node --test tools/skool-fee-calculator/calculator.test.js tests/usecase/tool-discovery.test.mjs tests/usecase/test-tool-addition.mjs`
- exact-once slug counts:
  - `tools/index.html`: `1`
  - `tools/index.md`: `1`
  - `_data/tools-list.json`: `1`
  - `tools/manifest.json`: `1`

## Blocked

- Localhost smoke server could not bind inside the sandbox.
- Exact blocker:
  - `PermissionError: [Errno 1] Operation not permitted` when running `python3 -m http.server 4173 --bind 127.0.0.1`

## Notes

- The tool-specific test suite also verifies discovery wiring exactly once across the four required discovery surfaces.
