# Test Cases — CF Pages Auto-Deploy recovery

## Functional
- **TC-F001**: `bash scripts/cf-pages-auto-deploy.sh --check` still reports the deployed source and returns `DEPLOY_REQUIRED` or `ALREADY_UP_TO_DATE` correctly.
- **TC-F002**: deploy path no longer uses `wrangler pages deploy .`; it uses a staged temp directory instead.
- **TC-F003**: dirty worktree state is passed explicitly to Wrangler via `--commit-dirty=true|false`.

## Failure-mode prevention
- **TC-P001**: current repo root file count remains above the Cloudflare Free Pages 20,000-file limit, proving `deploy .` is unsafe.
- **TC-P002**: the staged public subset stays below 20,000 files, proving the repaired deploy path avoids the same limit failure.

## Regression
- **TC-R001**: existing timeout helpers remain intact.
- **TC-R002**: existing output contract remains intact (`ALREADY_UP_TO_DATE`, `DEPLOY_REQUIRED`, `DEPLOYED_NEW=`).
- **TC-R003**: `bash -n scripts/cf-pages-auto-deploy.sh` passes.
