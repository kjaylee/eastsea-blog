# Verification — GoFundMe Fee Calculator

## Commands run
```bash
cd /Users/kjaylee/.openclaw/workspace/eastsea-blog
node --check tools/gofundme-fee-calculator/calculator.js
bash scripts/build-manifests.sh
node --test tools/gofundme-fee-calculator/calculator.test.js
python3 -m http.server 4174 >/tmp/gfm-http.log 2>&1 & echo $! >/tmp/gfm-http.pid
curl -I http://127.0.0.1:4174/tools/gofundme-fee-calculator/
curl -s http://127.0.0.1:4174/tools/gofundme-fee-calculator/ | grep -E 'GoFundMe Fee Calculator|2\.9% \+ \$0\.30|5% fee|0% platform fee'
pkill -f 'http.server 4174'
```

## Results
- `node --check`: pass
- `bash scripts/build-manifests.sh`: pass; `tools/manifest.json` rebuilt with `"count": 732`
- `node --test tools/gofundme-fee-calculator/calculator.test.js`: **8/8 passing**
- HTTP smoke: `200 OK` for `/tools/gofundme-fee-calculator/`
- Content markers confirmed in served HTML:
  - `GoFundMe Fee Calculator`
  - `0% platform fee`
  - `2.9% + $0.30`
  - `5% fee`
- Post-smoke cleanup check: `gfm-http-server-stopped`

## Exact wiring evidence
```text
tool_dir_exists= True
manifest_slug_count= 1
manifest_count_line= "count": 732,
```
