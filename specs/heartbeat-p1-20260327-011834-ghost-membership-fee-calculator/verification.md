# Verification

## Passed

```bash
node --check tools/ghost-membership-fee-calculator/calculator.js
node --check tools/ghost-membership-fee-calculator/calculator.test.js
node --test tools/ghost-membership-fee-calculator/calculator.test.js
node --test tests/usecase/tool-discovery.test.mjs
node -e "const fs=require('fs');const slug='ghost-membership-fee-calculator';const url='/tools/ghost-membership-fee-calculator/';const html=fs.readFileSync('tools/index.html','utf8');const md=fs.readFileSync('tools/index.md','utf8');const list=JSON.parse(fs.readFileSync('_data/tools-list.json','utf8'));const manifest=JSON.parse(fs.readFileSync('tools/manifest.json','utf8'));console.log(JSON.stringify({indexHtml:(html.match(new RegExp(slug,'g'))||[]).length,indexMd:(md.match(new RegExp(slug,'g'))||[]).length,toolsList:list.filter(x=>x.url===url).length,manifest:manifest.tools.filter(x=>x.slug===slug&&x.url===url).length,manifestCount:manifest.tools.length},null,2));"
node -e "const fs=require('fs');const html=fs.readFileSync('tools/index.html','utf8');console.log((html.match(/class=\\\"tool-card\\\"/g)||[]).length);"
```

Observed results:
- Tool-specific node tests: passed
- Tool discovery test: passed
- Exact-once counts: `1 / 1 / 1 / 1`
- `tools/manifest.json` count after ship: `690`
- `tools/index.html` rendered card count after ship: `675`

## Blocked

Localhost smoke:

```bash
python3 -m http.server 4173
```

Blocked with exact error:

```text
PermissionError: [Errno 1] Operation not permitted
```

The sandbox does not allow binding a local port in this environment.

Git metadata writes:

```bash
git add _data/tools-list.json tools/index.html tools/index.md tools/manifest.json tools/ghost-membership-fee-calculator specs/heartbeat-p1-20260327-011834-ghost-membership-fee-calculator
git commit -m "Add Ghost membership fee calculator"
```

Blocked with exact error:

```text
fatal: Unable to create '/Users/kjaylee/.openclaw/workspace/eastsea-blog/.git/worktrees/eastsea-hb-p1-20260327-011834/index.lock': Operation not permitted
```

Because git metadata is not writable from this sandboxed worktree, commit and push could not be completed in-agent.

## Unrelated baseline failure

This repo-level test failed but is unrelated to the Ghost tool changes:

```bash
node --test tests/integration/manifest-integrity.test.mjs tests/usecase/tool-discovery.test.mjs
```

Failure:

```text
Missing episode file: novels/_data/카페사장님은전생자입니다-010.md
```

That failure predates this tool slice and was not modified in this task.
