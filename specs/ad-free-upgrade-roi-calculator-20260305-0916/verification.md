# Verification — ad-free-upgrade-roi-calculator

## 1) Syntax checks
```bash
node --check tools/ad-free-upgrade-roi-calculator/logic.mjs && echo logic_check_exit:$?
node --check tools/ad-free-upgrade-roi-calculator/app.mjs && echo app_check_exit:$?
```
Result:
- `logic_check_exit:0`
- `app_check_exit:0`

## 2) Unit tests
- Not added for this tool.

## 3) Manifest build/update
```bash
bash scripts/build-manifests.sh
```
Result:
- `games/manifest.json: 357개`
- `tools/manifest.json: 543개`

## 4) Model sanity snapshot
```bash
node -e "import('./tools/ad-free-upgrade-roi-calculator/logic.mjs').then((m)=>{const r=m.calculateAdFreeUpgradeROI(m.DEFAULT_INPUT); console.log(JSON.stringify({adFreeSubscribers:r.adFreeSubscribers,netContributionPerSubscriber:r.netContributionPerSubscriber,netMonthlyBenefit:r.netMonthlyBenefit,roiPct:r.roiPct,paybackMonths:r.paybackMonths,breakEvenAttachRatePct:r.breakEvenAttachRatePct,status:r.status}, null, 2));});"
```
Result:
```json
{
  "adFreeSubscribers": 5440,
  "netContributionPerSubscriber": 2.24,
  "netMonthlyBenefit": 10393.76,
  "roiPct": 1285.83,
  "paybackMonths": 0.87,
  "breakEvenAttachRatePct": 0.47,
  "status": "strong"
}
```

## 5) HTTP/status proof
```bash
PORT=48321; python3 -m http.server "$PORT" --bind 127.0.0.1 >/tmp/ad_free_upgrade_tool_server.log 2>&1 & PID=$!; sleep 1; \
  echo "status:" $(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${PORT}/tools/ad-free-upgrade-roi-calculator/"); \
  echo "title:" $(curl -s "http://127.0.0.1:${PORT}/tools/ad-free-upgrade-roi-calculator/" | grep -o '<title>[^<]*</title>' | head -n 1); \
  kill "$PID" 2>/dev/null || true
```
Result:
- `status: 200`
- `title: <title>Ad-free Upgrade ROI Calculator | 광고 제거 업그레이드 ROI 계산기</title>`
