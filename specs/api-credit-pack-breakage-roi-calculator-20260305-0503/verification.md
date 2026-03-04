# Verification — api-credit-pack-breakage-roi-calculator

## 1) Syntax checks
```bash
node --check tools/api-credit-pack-breakage-roi-calculator/logic.mjs && echo logic_check_exit:$?
node --check tools/api-credit-pack-breakage-roi-calculator/app.mjs && echo app_check_exit:$?
```
Result:
- `logic_check_exit:0`
- `app_check_exit:0`

## 2) Unit tests
```bash
node --test tests/unit/api-credit-pack-breakage-roi-calculator.test.mjs
```
Result:
- tests: 7
- pass: 7
- fail: 0

## 3) Manifest build/update
```bash
bash scripts/build-manifests.sh
```
Result:
- `games/manifest.json: 357개`
- `tools/manifest.json: 532개`

## 4) Model sanity snapshot
```bash
node -e "import('./tools/api-credit-pack-breakage-roi-calculator/logic.mjs').then((m)=>{const r=m.calculateApiCreditPackBreakageROI(m.DEFAULT_INPUT); console.log(JSON.stringify({netContributionPerBuyer:r.netContributionPerBuyer,netMonthlyBenefit:r.netMonthlyBenefit,roiPct:r.roiPct,paybackMonths:r.paybackMonths,breakEvenTargetAdoptionPct:r.breakEvenTargetAdoptionPct,status:r.status}, null, 2));});"
```
Result:
```json
{
  "netContributionPerBuyer": 168.52,
  "netMonthlyBenefit": 7233.52,
  "roiPct": 210.01,
  "paybackMonths": 3.87,
  "breakEvenTargetAdoptionPct": 12.62,
  "status": "strong"
}
```

## 5) HTTP/status proof
```bash
PORT=48231; python3 -m http.server "$PORT" --bind 127.0.0.1 >/tmp/api_credit_pack_tool_server.log 2>&1 & PID=$!; sleep 1; \
  echo "status:" $(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${PORT}/tools/api-credit-pack-breakage-roi-calculator/"); \
  echo "title:" $(curl -s "http://127.0.0.1:${PORT}/tools/api-credit-pack-breakage-roi-calculator/" | grep -o '<title>[^<]*</title>' | head -n 1); \
  kill "$PID" 2>/dev/null || true
```
Result:
- `status: 200`
- `title: <title>API Credit Pack Breakage ROI Calculator | Usage Monetization Model</title>`
