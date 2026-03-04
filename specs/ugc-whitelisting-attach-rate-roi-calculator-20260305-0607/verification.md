# Verification — ugc-whitelisting-attach-rate-roi-calculator

## 1) Syntax checks
Command:
```bash
node --check tools/ugc-whitelisting-attach-rate-roi-calculator/logic.mjs
node --check tools/ugc-whitelisting-attach-rate-roi-calculator/app.mjs
```
Result:
- `CHECK_LOGIC=OK`
- `CHECK_APP=OK`

## 2) Unit tests
Command:
```bash
node --test tests/unit/ugc-whitelisting-attach-rate-roi-calculator.test.mjs
```
Result:
- suites: 1
- tests: 7
- pass: 7
- fail: 0

## 3) Manifest rebuild
Command:
```bash
bash scripts/build-manifests.sh
```
Result:
- `tools/manifest.json: 534개`
- new slug included: `ugc-whitelisting-attach-rate-roi-calculator`

## 4) Local HTTP/status proof
Command:
```bash
python3 -m http.server 48231
curl -s -o /tmp/ugc-whitelisting-attach-rate-roi-calculator.html -w "%{http_code}" \
  http://127.0.0.1:48231/tools/ugc-whitelisting-attach-rate-roi-calculator/
```
Result:
- `HTTP_STATUS=200`
- `PAGE_TITLE=UGC Whitelisting Attach Rate ROI Calculator | Creator Monetization Model`

## 5) Wiring checks
- Added discovery card in `tools/index.html`.
- Added markdown entry in `tools/index.md`.
- Added manifest entry in `tools/manifest.json`.
