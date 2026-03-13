# Verification — chargeback-representment-roi-calculator

## 1) Syntax verification
Command:
```bash
node --check tools/chargeback-representment-roi-calculator/logic.mjs; echo logic_check_exit:$?
node --check tools/chargeback-representment-roi-calculator/app.mjs; echo app_check_exit:$?
```

Exact output summary:
- `logic_check_exit:0`
- `app_check_exit:0`

## 2) Tool unit tests
Command:
```bash
node --test tests/unit/chargeback-representment-roi-calculator.test.mjs
```

Output summary (exact):
- `ℹ tests 7`
- `ℹ suites 1`
- `ℹ pass 7`
- `ℹ fail 0`

## 3) Manifest verification (current committed state)
Command:
```bash
node --test tests/unit/test-manifest.mjs
python3 - <<'PY'
import json
with open('tools/manifest.json','r',encoding='utf-8') as f:
    data=json.load(f)
print('count_field', data['count'])
print('actual_len', len(data['tools']))
print('has_slug', any(x['slug']=='chargeback-representment-roi-calculator' for x in data['tools']))
PY
```

Exact output summary:
- `ℹ tests 6`
- `ℹ pass 6`
- `ℹ fail 0`
- `count_field 570`
- `actual_len 570`
- `has_slug True`

## 4) Full rebuild check run during verification
Command:
```bash
bash scripts/build-manifests.sh
```

Observed output during verification:
- `games/manifest.json: 357개`
- `tools/manifest.json: 591개`
- `완료!`

Note:
- The repo was already dirty with many unrelated uncommitted tool directories and generated artifacts.
- After confirming the rebuild path works, the final commit intentionally kept only the minimal manifest change required for this shipped tool.

## 5) Numeric snapshot
Command:
```bash
node -e "import('./tools/chargeback-representment-roi-calculator/logic.mjs').then((m)=>{const r=m.calculateRepresentmentRoi(m.DEFAULT_INPUT); console.log(JSON.stringify({projectedRecoveredRevenue:r.projectedRecoveredRevenue,incrementalRecoveredRevenue:r.incrementalRecoveredRevenue,totalProgramCost:r.totalProgramCost,netLift:r.netLift,roiPct:r.roiPct,breakEvenProjectedWinRatePct:r.breakEvenProjectedWinRatePct,status:r.status}, null, 2));});"
```

Exact output:
```json
{
  "projectedRecoveredRevenue": 7128,
  "incrementalRecoveredRevenue": 3564,
  "totalProgramCost": 2427.64,
  "netLift": 1136.36,
  "roiPct": 46.81,
  "breakEvenProjectedWinRatePct": 28.24,
  "status": "balanced"
}
```

## 6) Manifest presence check
Command:
```bash
python3 - <<'PY'
import json
with open('tools/manifest.json','r',encoding='utf-8') as f:
    data=json.load(f)
items=[x for x in data['tools'] if x['slug']=='chargeback-representment-roi-calculator']
print(items[0] if items else 'MISSING')
PY
```

Exact output:
```python
{'slug': 'chargeback-representment-roi-calculator', 'title': 'Chargeback Representment ROI Calculator', 'url': '/tools/chargeback-representment-roi-calculator/', 'size': 23177}
```
