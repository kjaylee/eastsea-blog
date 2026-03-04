# Verification — ai-support-deflection-roi-calculator

## 1) Manifest rebuild
Command:
```bash
bash scripts/build-manifests.sh
```

Exact output:
- `games/manifest.json: 344개`
- `tools/manifest.json: 529개`
- `완료!`

## 2) Required unit test command
Command:
```bash
node --test tests/unit/ai-support-deflection-roi-calculator.test.mjs
```

Output summary (exact):
- `ℹ tests 7`
- `ℹ suites 1`
- `ℹ pass 7`
- `ℹ fail 0`

## 3) Required manifest test command
Command:
```bash
node --test tests/unit/test-manifest.mjs
```

Output summary (exact):
- `ℹ tests 6`
- `ℹ suites 0`
- `ℹ pass 6`
- `ℹ fail 0`

## 4) Logic snapshot (default input)
Command:
```bash
node -e "import('./tools/ai-support-deflection-roi-calculator/logic.mjs').then((m)=>{const r=m.calculateSupportDeflectionROI(m.DEFAULT_INPUT); console.log(JSON.stringify({netMonthlyBenefit:r.netMonthlyBenefit,annualNetBenefit:r.annualNetBenefit,roiPct:r.roiPct,paybackMonths:r.paybackMonths,breakEvenTargetDeflectionPct:r.breakEvenTargetDeflectionPct,status:r.status}, null, 2));});"
```

Exact output:
```json
{
  "netMonthlyBenefit": 16975.43,
  "annualNetBenefit": 203705.2,
  "roiPct": 190.34,
  "paybackMonths": 0.94,
  "breakEvenTargetDeflectionPct": 20.02,
  "status": "strong"
}
```

## 5) Syntax checks
Command:
```bash
node --check tools/ai-support-deflection-roi-calculator/logic.mjs && echo logic_check_exit:$?
node --check tools/ai-support-deflection-roi-calculator/app.mjs && echo app_check_exit:$?
```

Exact output summary:
- `logic_check_exit:0`
- `app_check_exit:0`

## 6) Route/title smoke check via curl
Command:
```bash
PORT=48173; python3 -m http.server "$PORT" --bind 127.0.0.1 >/tmp/ai_support_tool_server.log 2>&1 & PID=$!; sleep 1; curl -s "http://127.0.0.1:${PORT}/tools/ai-support-deflection-roi-calculator/" | grep -o '<title>[^<]*</title>' | head -n 1; kill "$PID" 2>/dev/null || true
```

Exact output:
- `<title>AI Support Deflection ROI Calculator | Ticket Automation Profit Model</title>`
