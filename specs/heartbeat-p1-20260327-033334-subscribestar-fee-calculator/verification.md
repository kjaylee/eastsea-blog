# Verification — SubscribeStar Fee Calculator

## Executed

```bash
node --check tools/subscribestar-fee-calculator/calculator.js
node --check tools/subscribestar-fee-calculator/calculator.test.js
node --test tools/subscribestar-fee-calculator/calculator.test.js
node -e "const fs=require('fs');const slug='subscribestar-fee-calculator';const url='/tools/'+slug+'/';const html=fs.readFileSync('tools/index.html','utf8');const md=fs.readFileSync('tools/index.md','utf8');const list=JSON.parse(fs.readFileSync('_data/tools-list.json','utf8'));const manifest=JSON.parse(fs.readFileSync('tools/manifest.json','utf8'));console.log(JSON.stringify({html:(html.match(new RegExp('href=\\\"'+slug+'/\\\"','g'))||[]).length,md:(md.match(new RegExp('\\\\(\\\\./'+slug+'/\\\\)','g'))||[]).length,list:list.filter((entry)=>entry.url===url).length,manifest:manifest.tools.filter((entry)=>entry.slug===slug&&entry.url===url).length},null,2));"
```

## Results
- `node --check tools/subscribestar-fee-calculator/calculator.js`: pass
- `node --check tools/subscribestar-fee-calculator/calculator.test.js`: pass
- `node --test tools/subscribestar-fee-calculator/calculator.test.js`: pass, 13/13 tests green
- Exact-once slug counts: pass
  - `tools/index.html`: 1
  - `tools/index.md`: 1
  - `_data/tools-list.json`: 1
  - `tools/manifest.json`: 1

## Localhost smoke
Attempted:

```bash
python3 -m http.server 4173
```

Blocked by sandbox:
- `PermissionError: [Errno 1] Operation not permitted`

Conclusion:
- Verification complete except live localhost smoke, which could not run in this environment.
