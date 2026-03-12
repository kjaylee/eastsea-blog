# Plan — CF Pages Auto-Deploy timeout

## Scope
Touch only the cron deploy script and task artifacts required by the process.

## Implementation steps
1. Add small timeout/logging helpers inside `scripts/cf-pages-auto-deploy.sh`.
2. Put `wrangler pages deployment list` behind a short bounded timeout.
3. Put `wrangler pages deploy` behind a bounded timeout shorter than the cron's 300s ceiling.
4. Replace the raw `| tail -3` pipeline with temp-log capture + controlled tail output.
5. On deploy timeout/failure, run one post-check against production source:
   - if production already matches `HEAD`, return success,
   - else fail with concise last-log output.
6. Keep output contract stable:
   - `ALREADY_UP_TO_DATE`
   - `DEPLOY_REQUIRED`
   - `DEPLOYED_NEW=<hash>`

## Non-goals
- No cron schedule change.
- No gateway config change.
- No Cloudflare project setting change.
- No repo restructuring.

## Verification commands
1. `bash scripts/cf-pages-auto-deploy.sh --check`
2. `bash scripts/cf-pages-auto-deploy.sh`
3. `bash scripts/cf-pages-auto-deploy.sh --check`
4. `git diff -- scripts/cf-pages-auto-deploy.sh specs/cf-pages-auto-deploy-timeout-20260312-1559/`

## Risk notes
- The deploy command still talks to Cloudflare; network/API variance remains possible.
- The patch should convert hangs into bounded, diagnosable failures instead of opaque cron timeouts.
