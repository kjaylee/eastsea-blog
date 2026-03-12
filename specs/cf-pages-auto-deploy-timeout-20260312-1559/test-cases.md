# Test Cases — CF Pages Auto-Deploy timeout

## Functional
- **TC-F001**: `--check` returns `ALREADY_UP_TO_DATE` when production source equals `HEAD`.
- **TC-F002**: normal deploy path still succeeds and prints `DEPLOYED_NEW=<short-hash>`.
- **TC-F003**: if deploy command exits non-zero, the script prints recent Wrangler log context before failing.
- **TC-F004**: if deploy command times out but production already matches `HEAD` on the follow-up check, the script exits successfully.

## Reliability
- **TC-R001**: list step is bounded by an internal timeout shorter than the cron timeout.
- **TC-R002**: deploy step is bounded by an internal timeout shorter than the cron timeout.
- **TC-R003**: combined worst-case script path stays below the outer 300s cron ceiling.

## Regression
- **TC-G001**: the script still uses the same project/branch env vars (`CF_PAGES_PROJECT_NAME`, `CF_PAGES_BRANCH`).
- **TC-G002**: output contract remains compatible with the cron prompt parser (`ALREADY_UP_TO_DATE`, `DEPLOY_REQUIRED`, `DEPLOYED_NEW=`).
- **TC-G003**: `bash -n scripts/cf-pages-auto-deploy.sh` passes.
