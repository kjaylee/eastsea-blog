# Verification — premium-support-attach-rate-roi-calculator

## 1) Syntax checks
Command:
```bash
node --check tools/premium-support-attach-rate-roi-calculator/logic.mjs && echo "CHECK_LOGIC=OK"
node --check tools/premium-support-attach-rate-roi-calculator/app.mjs && echo "CHECK_APP=OK"
```
Result:
- `CHECK_LOGIC=OK`
- `CHECK_APP=OK`

## 2) Unit tests
Command:
```bash
node --test tests/unit/premium-support-attach-rate-roi-calculator.test.mjs
```
Result:
- suites: 1
- tests: 7
- pass: 7
- fail: 0

## 3) Manifest rebuild (repo wiring)
Command:
```bash
bash scripts/build-manifests.sh
```
Result:
- `games/manifest.json: 357개`
- `tools/manifest.json: 531개`
- `완료!`

## 4) Local HTTP/status proof
Command:
```bash
python3 -m http.server 48173
curl -s -o <tmp> -w "%{http_code}" http://127.0.0.1:48173/tools/premium-support-attach-rate-roi-calculator/
```
Result:
- `SERVER_PID=36913`
- `HTTP_STATUS=200`
- `PAGE_TITLE=Premium Support Attach Rate ROI Calculator | B2B SaaS Monetization Model`

## 5) Integration checks
- Added discoverability card in `tools/index.html`
- Added calculator entry to `tools/manifest.json` via build script
- New unit test file included in `tests/unit/`
