# Verification — Creator Brand Deal Take-home Calculator

## Commands run
- `bash scripts/build-manifests.sh`
  - Result: pass
  - Evidence: regenerated `tools/manifest.json` includes `creator-brand-deal-take-home-calculator`
- `node --test tests/unit/creator-brand-deal-take-home-calculator.test.mjs`
  - Result: pass (`9/9`)
- `node --test tests/usecase/tool-discovery.test.mjs`
  - Result: pass (`8/8`)
- Manual exact-once check via Node script
  - Result:
    - `tools/index.html`: `1`
    - `tools/index.md`: `1`
    - `_data/tools-list.json`: `1`
    - `tools/manifest.json`: `1`

## Spot-checked outputs
- Default scenario:
  - Brand quote: `$5,400.00`
  - Creator net take-home: `$2,678.33`
  - Required quote for target net: `$6,785.04`
  - Required base fee per deliverable: `$1,661.68`

## Broader repo baseline observed
- `node --test tests/integration/manifest-integrity.test.mjs tests/integration/link-integrity.test.mjs`
  - Result: fails, but failures are pre-existing repo-baseline issues outside this tool slice:
    - `posts.json` entries missing `filename`
    - `_posts` vs `posts.json` mismatch
    - `novels/manifest.json` references missing episode file `novels/_data/카페사장님은전생자입니다-010.md`
  - Tool-specific manifest count/link assertions were resolved after serial manifest rebuild.

## Git commit attempt
- Attempted:
  - `git add ... && git commit -m "Add creator brand deal take-home calculator"`
- Result: blocked by sandbox permissions
- Exact error:
  - `fatal: Unable to create '/Users/kjaylee/.openclaw/workspace/eastsea-blog/.git/worktrees/eastsea-hb-p1-tool-20260329-022333/index.lock': Operation not permitted`
- Impact:
  - code and artifacts are present in the worktree
  - local commit could not be created from this sandboxed session
