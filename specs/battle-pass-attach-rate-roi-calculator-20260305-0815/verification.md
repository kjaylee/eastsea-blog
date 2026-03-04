# Verification — battle-pass-attach-rate-roi-calculator

## 1) Syntax checks
Command:
```bash
node --check tools/battle-pass-attach-rate-roi-calculator/logic.mjs
node --check tools/battle-pass-attach-rate-roi-calculator/app.mjs
```
Result:
- `CHECK_LOGIC=OK`
- `CHECK_APP=OK`

## 2) Manifest rebuild
Command:
```bash
bash scripts/build-manifests.sh
```
Result:
- `tools/manifest.json: 539개`
- new slug included: `battle-pass-attach-rate-roi-calculator`

## 3) Local HTTP/status proof
Command:
```bash
python3 -m http.server 8123
curl -I http://localhost:8123/tools/battle-pass-attach-rate-roi-calculator/
```
Result:
- `HTTP_STATUS=200`

## 4) Wiring checks
- Added discovery card in `tools/index.html`.
- Added markdown entry in `tools/index.md`.
- Added manifest entry in `tools/manifest.json`.
