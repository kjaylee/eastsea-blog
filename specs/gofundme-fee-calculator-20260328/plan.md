# Plan — GoFundMe Fee Calculator

## Objective
Ship a narrow, verifiable first slice for a net-new fundraising fee tool.

## Steps
1. Create `tools/gofundme-fee-calculator/`.
2. Implement pure math + validation in `calculator.js`.
3. Build responsive `index.html` with stable IDs and a copyable summary.
4. Add deterministic tests in `calculator.test.js`.
5. Rebuild `tools/manifest.json`.
6. Run syntax check, tests, exact-once manifest check, and localhost HTTP smoke.
7. Score the slice against spec; record any deferred gaps.

## Verification commands
- `node --check tools/gofundme-fee-calculator/calculator.js`
- `bash scripts/build-manifests.sh`
- `node --test tools/gofundme-fee-calculator/calculator.test.js`
- `python3 -m http.server 4174 >/tmp/gfm-http.log 2>&1 & echo $! >/tmp/gfm-http.pid`
- `curl -I http://127.0.0.1:4174/tools/gofundme-fee-calculator/`
- `curl -s http://127.0.0.1:4174/tools/gofundme-fee-calculator/ | grep -E 'GoFundMe Fee Calculator|2\.9% \+ \$0\.30|5% fee|0% platform fee'`
- `pkill -f 'http.server 4174'`

## Risk posture
Avoid editing already-dirty shared catalog surfaces in this slice. Manifest-only wiring is sufficient to count the tool and keep the change surgical.
