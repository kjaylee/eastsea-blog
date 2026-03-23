# Verification — Mortgage Extra Payment / BMI+BFP / CAGR Trio

## Commands run

### 1) Inline script syntax parse
```bash
python3 - <<'PY'
from pathlib import Path
import re, subprocess, tempfile
repo = Path('/Users/kjaylee/.openclaw/workspace/eastsea-blog')
for path in [
    repo / 'tools/mortgage-extra-payment-calculator/index.html',
    repo / 'tools/bmi-bfp-calculator/index.html',
    repo / 'tools/cagr-calculator/index.html',
]:
    text = path.read_text()
    scripts = re.findall(r'<script>([\s\S]*?)</script>', text)
    inline = scripts[-1]
    tmp = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False)
    tmp.write(f"new Function({inline!r}); console.log('OK {path.name}')\n")
    tmp.close()
    subprocess.run(['node', tmp.name], check=True)
PY
```
Result: PASS for all 3 pages.

### 2) Deterministic numeric spot checks
```bash
python3 - <<'PY'
# mortgage / bmi+bfp / cagr spot checks
PY
```
Result:
- Mortgage base monthly payment: `1,467,052`
- Mortgage accelerated payoff: `264 months`
- Mortgage interest saved in sample: `68,571,640`
- BMI sample (175cm, 72kg): `23.5`
- Male BFP sample (175/72, neck 38, waist 85): `17.0%`
- CAGR sample (10,000,000 → 18,500,000 over 3y): `22.76%`

### 3) Manifest rebuild
```bash
bash scripts/build-manifests.sh
```
Result:
- `games/manifest.json: 357개`
- `tools/manifest.json: 610개`
- `완료!`

### 4) Catalog exact-once checks
Result:
- `mortgage-extra-payment-calculator`: tools-list `1`, manifest `1`, tools/index.html `1`, tools/index.md `1`
- `bmi-bfp-calculator`: tools-list `1`, manifest `1`, tools/index.html `1`, tools/index.md `1`
- `cagr-calculator`: tools-list `1`, manifest `1`, tools/index.html `1`, tools/index.md `1`

### 5) Local HTTP smoke
Result:
- `/tools/mortgage-extra-payment-calculator/` → `200`
- `/tools/bmi-bfp-calculator/` → `200`
- `/tools/cagr-calculator/` → `200`

## Notes
- `cagr-calculator` was refreshed in place instead of duplicated, because the slug already existed in the repo and `_data/tools-list.json`.
- Verification used local parse / formula / static-server checks only. No browser automation was used.
