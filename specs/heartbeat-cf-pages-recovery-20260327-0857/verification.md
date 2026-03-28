# Verification — CF Pages Auto-Deploy recovery

## Commands run
```bash
cd /Users/kjaylee/.openclaw/workspace/eastsea-blog
bash -n scripts/cf-pages-auto-deploy.sh
bash scripts/cf-pages-auto-deploy.sh --check
grep -n 'wrangler pages deploy\|commit-dirty\|stage_site_dir\|CF_PAGES_MAX_FILES' scripts/cf-pages-auto-deploy.sh
python3 -c "from pathlib import Path; root=Path('.'); count=sum(1 for p in root.rglob('*') if p.is_file()); print({'repo_file_count': count}); assert count > 20000"
python3 - <<'PY'
from pathlib import Path
root = Path('.')
keep_files = ['.nojekyll','CNAME','_redirects','about.html','ads.txt','contact.html','index.html','posts.json','privacy.html','robots.txt','sitemap.xml','terms.html','view.html']
keep_dirs = ['_data','_posts','assets','docs','games','hotdeal','novels','posts','static','tools']
count = sum(1 for name in keep_files if (root / name).is_file())
for name in keep_dirs:
    base = root / name
    if base.is_dir():
        count += sum(1 for p in base.rglob('*') if p.is_file())
print({'staged_subset_file_count': count})
assert count < 20000
PY
git diff --stat -- scripts/cf-pages-auto-deploy.sh specs/heartbeat-cf-pages-recovery-20260327-0857/
```

## Results
- `bash -n scripts/cf-pages-auto-deploy.sh` — passed
- `bash scripts/cf-pages-auto-deploy.sh --check` — passed
  - output:
    - `DEPLOYED=54e6216 HEAD=d291f5a`
    - `DEPLOY_REQUIRED`
- deploy-path grep — passed
  - script now contains:
    - `CF_PAGES_MAX_FILES`
    - `stage_site_dir()`
    - `npx wrangler pages deploy "$STAGED_DIR"`
    - `--commit-dirty="$WORKTREE_DIRTY"`
- old repo-root deploy input count — passed
  - `repo_file_count: 30121`
  - confirms `deploy .` exceeds Cloudflare Free Pages 20,000-file limit
- repaired staged deploy input count — passed
  - `staged_subset_file_count: 2710`
  - confirms the staged public subset is safely below the 20,000-file limit
- scoped diff — passed
  - only the target script plus the new spec artifact directory are part of this repair scope

## Why no live deploy verification
A live `wrangler pages deploy` would publish the current dirty worktree to production. That is unsafe for this repair. The deterministic validation above is sufficient to prove the original failure mode is removed without risking unrelated site changes.

## Repo state note
The repository was already heavily dirty before this task. I kept edits scoped to:
- `scripts/cf-pages-auto-deploy.sh`
- `specs/heartbeat-cf-pages-recovery-20260327-0857/`
