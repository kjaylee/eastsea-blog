# Verification — white-label-agency-margin-calculator

## 1) Manifest rebuild
Command:
```bash
bash scripts/build-manifests.sh
```

Output summary (exact):
- `games/manifest.json: 344개`
- `tools/manifest.json: 528개`
- `완료!`

## 2) Required unit test command
Command:
```bash
node --test tests/unit/white-label-agency-margin-calculator.test.mjs
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

## 4) Tool logic numeric snapshot (Node snippet)
Command:
```bash
node -e "import('./tools/white-label-agency-margin-calculator/logic.mjs').then((m)=>{const r=m.calculateAgencyMargin(m.DEFAULT_INPUT); console.log(JSON.stringify({recommendedRetainer:r.recommendedRetainer,breakEvenRetainer:r.breakEvenRetainer,currentOperatingMarginPct:r.currentOperatingMarginPct,totalMonthlyCost:r.totalMonthlyCost,status:r.status}, null, 2));});"
```

Exact output:
```json
{
  "recommendedRetainer": 14020.79,
  "breakEvenRetainer": 9977.72,
  "currentOperatingMarginPct": -45.38,
  "totalMonthlyCost": 9688.37,
  "status": "risky"
}
```

## 5) Syntax verification (explicit exit checks)
Command:
```bash
node --check tools/white-label-agency-margin-calculator/app.mjs; echo app_check_exit:$?
node --check tools/white-label-agency-margin-calculator/logic.mjs; echo logic_check_exit:$?
```

Exact output summary:
- `app_check_exit:0`
- `logic_check_exit:0`
