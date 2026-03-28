# Research — CF Pages Auto-Deploy recovery (2026-03-27 08:57)

## Objective
Repair the failing cron `CF Pages Auto-Deploy (eastsea-blog)` with the smallest safe change to `scripts/cf-pages-auto-deploy.sh`, keeping the repo structure intact and avoiding destructive cleanup.

## Scope constraints
- Repo: `/Users/kjaylee/.openclaw/workspace/eastsea-blog`
- Keep edits surgical and reversible.
- Do not clean or rewrite the already-dirty repo.
- Prefer deterministic validation over a live deploy from a dirty worktree.

## Skill selected
- `devops`
- Reason: this is a deployment/cron hardening issue.

## Evidence collected
### 1) Current script behavior
`bash scripts/cf-pages-auto-deploy.sh --check` currently reports:
- `DEPLOYED=54e6216 HEAD=d291f5a`
- `DEPLOY_REQUIRED`

The deploy path in `scripts/cf-pages-auto-deploy.sh` currently runs:
```bash
npx wrangler pages deploy . \
  --project-name="$PROJECT_NAME" \
  --branch="$BRANCH" \
  --commit-hash="$HEAD_FULL"
```
So Wrangler receives the entire repo root as the Pages asset directory.

### 2) Repo root file count is above Cloudflare Free Pages limit
Measured on the current repo:
- total files under repo root: **30112**
- likely public-site subset (root public files + `_data`, `_posts`, `assets`, `docs`, `games`, `hotdeal`, `novels`, `posts`, `static`, `tools`): **2710**

Large non-site contributors include:
- `.git`: 6820 files
- `.worktrees`: 19315 files
- `specs`: 862 files
- `.state`: 158 files
- `tmp`: 65 files
- `tests`: 68 files
- `scripts`: 19 files

### 3) Cloudflare Pages limit matches the observed error
Cloudflare Pages docs (`https://developers.cloudflare.com/pages/platform/limits/`) state:
- Free plan sites can contain up to **20,000 files**.

That aligns with the reported error fragment: `Pages only supports up to 2…`.

### 4) Dirty worktree is real and explains the warning
`git status --short` shows many unrelated modified and untracked files. Therefore Wrangler warning about a dirty git repo is expected if the script deploys directly from the repo worktree while attaching `--commit-hash` metadata.

## Root cause
The March timeout hardening fix is already present. The new failure is different:

1. `wrangler pages deploy .` deploys the entire repository root.
2. The repo now contains ~30k files because hidden/internal directories are present (`.git`, `.worktrees`, specs, tmp, etc.).
3. Cloudflare Free Pages rejects deployments above 20k files.
4. The repo is also dirty, so Wrangler surfaces dirty-worktree warnings during deploy.

## Minimal safe fix direction
Do not deploy `.` directly.

Instead:
1. stage only the actual public-site files/directories into a temp deploy directory,
2. deploy that staged directory,
3. pass an explicit `--commit-dirty=<true|false>` flag so dirty-worktree metadata is deliberate rather than a surprise warning,
4. keep the existing `HEAD -> compare -> deploy if needed` flow and timeout guards.

## Why this is the smallest safe fix
- No cleanup of the real repo.
- No cron/gateway/config changes.
- No broad restructuring.
- Only one script changes.
- Keeps deploy semantics the same while removing non-site/internal files from the upload set.
