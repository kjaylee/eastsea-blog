# Plan — CF Pages Auto-Deploy recovery

## Scope
Touch only:
- `scripts/cf-pages-auto-deploy.sh`
- required task artifacts under `specs/heartbeat-cf-pages-recovery-20260327-0857/`

## Implementation steps
1. Keep the existing timeout/list/deploy flow intact.
2. Add a tiny staging helper that copies only public-site files/directories into a temp folder.
3. Swap Wrangler deploy input from `.` to the staged temp folder.
4. Detect whether the repo worktree is dirty and pass `--commit-dirty=true|false` explicitly.
5. Preserve current output contract (`ALREADY_UP_TO_DATE`, `DEPLOY_REQUIRED`, `DEPLOYED_NEW=`).
6. Verify with syntax check, `--check`, and deterministic file-limit validation.

## Non-goals
- No actual cleanup of `.git`, `.worktrees`, `specs`, `tmp`, or other repo contents.
- No deploy schedule change.
- No Pages project setting change.
- No live production deploy from the current dirty worktree unless strictly necessary.

## Verification commands
```bash
cd /Users/kjaylee/.openclaw/workspace/eastsea-blog
bash -n scripts/cf-pages-auto-deploy.sh
bash scripts/cf-pages-auto-deploy.sh --check
python3 - <<'PY'
from pathlib import Path
root = Path('.')
count = sum(1 for p in root.rglob('*') if p.is_file())
print({'repo_file_count': count})
assert count > 20000
PY
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
```
