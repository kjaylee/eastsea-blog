# Verification — apple-search-ads-cpt-ltv-roi-calculator

## 1) Syntax check
Command:
```bash
node --check tools/apple-search-ads-cpt-ltv-roi-calculator/script.js && echo CHECK_SCRIPT=OK
```
Result:
- `CHECK_SCRIPT=OK`

## 2) Manifest rebuild
Command:
```bash
bash scripts/build-manifests.sh
```
Result:
- `tools/manifest.json: 540개`
- new slug included: `apple-search-ads-cpt-ltv-roi-calculator`

## 3) Local HTTP 200 proof
Command:
```bash
python3 -m http.server 8892
curl -o /dev/null -s -w "%{http_code}" http://127.0.0.1:8892/tools/apple-search-ads-cpt-ltv-roi-calculator/
```
Result:
- `HTTP_STATUS=200`

## 4) Wiring checks
- Added tool card in `tools/index.html`.
- Added markdown list item in `tools/index.md`.
- Updated `tools/manifest.json` via build script.
