# Research — CF Pages Auto-Deploy timeout

## Objective
Stop the recurring opaque cron failure in `scripts/cf-pages-auto-deploy.sh` for the job **CF Pages Auto-Deploy (eastsea-blog)** while keeping the existing deploy flow and repo structure intact.

## Repo + process constraints
- Repo boundary verified: `/Users/kjaylee/.openclaw/workspace/eastsea-blog`
- Minimal-change rule: keep the current `git HEAD -> compare -> deploy if needed` structure.
- Destructive actions forbidden.
- Verification should be command-based first (`bash`, `git`, `curl`/CLI output), not assumption-based.

## Skill selected
- Selected skill: `devops`
- Why: this is a deployment automation + cron hardening issue.

## Evidence collected
### 1) Cron run history
`cron runs` for job `31867cbc-f416-419c-9178-29e5ccf4c5db` shows:
- repeated failures with `cron: job execution timed out`
- timeout duration consistently `300006~300008ms`
- neighboring successful runs usually finish in `24s~95s`

Interpretation:
- the outer cron timeout is killing the job, not a deterministic shell syntax failure.
- the problem is intermittent and likely occurs during the Wrangler API/deploy phase.

### 2) Current script behavior
Current `scripts/cf-pages-auto-deploy.sh`:
- calls `npx wrangler pages deployment list ... --json`
- compares production source with `git rev-parse HEAD`
- if different, calls `npx wrangler pages deploy . ...`
- deploy output is truncated through `tail -3`

Weak points in the current version:
1. **No internal timeout control** for Wrangler commands.
2. **No recovery path** if deploy CLI hangs after the server accepted the deployment.
3. **Very little error context** because deploy output is reduced to the last 3 lines only.
4. Outer cron therefore reports only `job execution timed out`, which is too coarse to diagnose.

### 3) Manual reproduction / baseline
Manual checks today:
- `bash scripts/cf-pages-auto-deploy.sh --check` completed immediately with `ALREADY_UP_TO_DATE`.
- direct manual deploy via Wrangler completed successfully in about **24.79s**.
- Wrangler reported scanning/uploading **3230 files** before deployment.

Interpretation:
- the normal path is fast enough.
- when Cloudflare/Wrangler stalls, the script lacks a bounded failure mode and gets killed by cron.

## Root-cause conclusion
The actionable root cause is **missing script-level timeout and recovery handling around Wrangler commands**.

More specifically:
- the cron allows 300s total,
- the script gives Wrangler unlimited time inside that window,
- when Wrangler hangs or becomes slow, cron terminates the whole agent run,
- because deploy output is truncated, the failure is not actionable.

## Fix direction
Apply a minimal hardening patch to the script:
1. add bounded per-command timeouts for Wrangler calls,
2. capture logs to temp files instead of piping directly to `tail -3`,
3. after a deploy timeout/failure, re-check the current production source once,
4. if production already matches `HEAD`, treat it as success and return `DEPLOYED_NEW=...`,
5. otherwise print the last relevant log lines and fail fast before the outer cron timeout.

## Verification plan
1. `bash scripts/cf-pages-auto-deploy.sh --check`
2. direct deploy command through the hardened script path (actual deploy/redeploy allowed)
3. rerun `bash scripts/cf-pages-auto-deploy.sh --check` and confirm `ALREADY_UP_TO_DATE`
4. inspect git diff for only the intended script/spec changes

## Acceptance bar
- The script must no longer rely on the outer cron timeout to stop hung Wrangler work.
- Failure output must contain actionable deploy/list log context.
- Successful deployment must still emit `DEPLOYED_NEW=<short-hash>`.
- Up-to-date path must still emit `ALREADY_UP_TO_DATE`.
