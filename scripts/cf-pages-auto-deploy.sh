#!/bin/bash
# Check current CF Pages production deployment and deploy only when HEAD differs.
set -euo pipefail

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

cd "$(dirname "$0")/.."

PROJECT_NAME="${CF_PAGES_PROJECT_NAME:-eastsea-blog}"
BRANCH="${CF_PAGES_BRANCH:-master}"
MODE="${1:-}"
WRANGLER_LIST_TIMEOUT="${CF_PAGES_LIST_TIMEOUT:-30}"
WRANGLER_DEPLOY_TIMEOUT="${CF_PAGES_DEPLOY_TIMEOUT:-210}"
LOG_TAIL_LINES="${CF_PAGES_LOG_TAIL_LINES:-20}"
CF_PAGES_MAX_FILES="${CF_PAGES_MAX_FILES:-20000}"
PREDEPLOY_GATE_CONFIG="${CF_PAGES_PREDEPLOY_GATE_CONFIG:-}"
PREDEPLOY_GATE_SCRIPT="${CF_PAGES_PREDEPLOY_GATE_SCRIPT:-scripts/verify-canonical-devlog-assets.js}"
KEEP_STAGED_DIR="${CF_PAGES_KEEP_STAGED_DIR:-0}"
STAGED_DIR=""

count_staged_files() {
  local stage_dir="$1"

  python3 - "$stage_dir" <<'PY'
from pathlib import Path
import sys

target = Path(sys.argv[1])
print(sum(1 for path in target.rglob('*') if path.is_file()))
PY
}

cleanup() {
  if [[ "$KEEP_STAGED_DIR" == "1" ]]; then
    return 0
  fi

  if [[ -n "$STAGED_DIR" && -d "$STAGED_DIR" ]]; then
    rm -rf "$STAGED_DIR"
  fi
}
trap cleanup EXIT

run_with_timeout() {
  local timeout="$1"
  local log_file="$2"
  shift 2

  python3 - "$timeout" "$log_file" "$@" <<'PY'
import subprocess
import sys


timeout = int(sys.argv[1])
log_path = sys.argv[2]
cmd = sys.argv[3:]

with open(log_path, 'w', encoding='utf-8') as log:
    try:
        completed = subprocess.run(
            cmd,
            stdout=log,
            stderr=None,  # Keep stderr separate so npm warnings don't pollute JSON stdout
            text=True,
            timeout=timeout,
            check=False,
        )
    except subprocess.TimeoutExpired as exc:
        if exc.stdout:
            log.write(exc.stdout)
        if exc.stderr:
            log.write(exc.stderr)
        log.write(f"\nWRANGLER_TIMEOUT:{timeout}s {' '.join(cmd)}\n")
        raise SystemExit(124)

raise SystemExit(completed.returncode)
PY
}

print_log_tail() {
  local log_file="$1"

  [[ -s "$log_file" ]] || return 0

  python3 - "$LOG_TAIL_LINES" "$log_file" <<'PY'
from pathlib import Path
import sys

line_count = int(sys.argv[1])
log_path = Path(sys.argv[2])
lines = log_path.read_text(encoding='utf-8', errors='replace').splitlines()
tail = lines[-line_count:]
if tail:
    print("\n".join(tail))
PY
}

stage_site_dir() {
  local stage_dir
  stage_dir="$(mktemp -d "${TMPDIR:-/tmp}/cf-pages-deploy.XXXXXX")"

  if ! python3 - "$PWD" "$stage_dir" "$CF_PAGES_MAX_FILES" <<'PY'
from pathlib import Path
import shutil
import sys

source = Path(sys.argv[1])
target = Path(sys.argv[2])
max_files = int(sys.argv[3])

public_files = [
    '.nojekyll',
    'CNAME',
    '_redirects',
    'about.html',
    'ads.txt',
    'contact.html',
    'index.html',
    'posts.json',
    'privacy.html',
    'robots.txt',
    'sitemap.xml',
    'terms.html',
    'view.html',
]
public_dirs = [
    '_data',
    '_posts',
    'assets',
    'docs',
    'games',
    'hotdeal',
    'images',
    'novels',
    'posts',
    'research',
    'static',
    'tools',
]

for rel in public_files:
    src = source / rel
    if src.is_file():
        dest = target / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dest)

def ignore_large_and_backup(path, names):
    # Exclude Godot wasm backup/original files (can be 30-40MB each, CF Pages limit is 25MB)
    # Also exclude .DS_Store, Thumbs.db, and other system files
    path = Path(path)
    exclude = {n for n in names if n.endswith(('.wasm.orig', '.wasm.bak', '.DS_Store', 'Thumbs.db'))}
    # Size-based exclusion for wasm files (anything over 25MB)
    large = set()
    for n in names:
        if n.endswith('.wasm') or n.endswith('.pck'):
            full = path / n
            try:
                if full.stat().st_size > 25 * 1024 * 1024:
                    large.add(n)
            except OSError:
                pass
    return exclude | large

for rel in public_dirs:
    src = source / rel
    if src.is_dir():
        shutil.copytree(src, target / rel, dirs_exist_ok=True, ignore=ignore_large_and_backup)

file_count = sum(1 for path in target.rglob('*') if path.is_file())
if file_count > max_files:
    print(f'STAGED_FILE_LIMIT_EXCEEDED:{file_count}>{max_files}', file=sys.stderr)
    raise SystemExit(2)
PY
  then
    rm -rf "$stage_dir"
    return 1
  fi

  printf '%s\n' "$stage_dir"
}

run_predeploy_gate() {
  [[ -n "$PREDEPLOY_GATE_CONFIG" ]] || return 0

  if [[ ! -f "$PREDEPLOY_GATE_SCRIPT" ]]; then
    echo "PREDEPLOY_GATE_SCRIPT_MISSING=$PREDEPLOY_GATE_SCRIPT" >&2
    return 1
  fi

  if [[ ! -f "$PREDEPLOY_GATE_CONFIG" ]]; then
    echo "PREDEPLOY_GATE_CONFIG_MISSING=$PREDEPLOY_GATE_CONFIG" >&2
    return 1
  fi

  echo "Running predeploy gate: $PREDEPLOY_GATE_CONFIG"
  node "$PREDEPLOY_GATE_SCRIPT" "$PREDEPLOY_GATE_CONFIG"
}

is_deployed_head() {
  local deployed_source="$1"

  [[ "$deployed_source" == "$HEAD_SHORT" || \
     "$deployed_source" == "$HEAD_FULL" || \
     "$HEAD_FULL" == "$deployed_source"* || \
     "$deployed_source" == "$HEAD_FULL"* ]]
}

get_deployed_source() {
  local log_file
  log_file="$(mktemp)"

  if ! run_with_timeout \
    "$WRANGLER_LIST_TIMEOUT" \
    "$log_file" \
    npx wrangler pages deployment list \
      --project-name="$PROJECT_NAME" \
      --environment=production \
      --json; then
    print_log_tail "$log_file" >&2
    rm -f "$log_file"
    return 1
  fi

  local deployed_source
  if ! deployed_source="$(python3 - "$log_file" <<'PY'
import json
import sys
from pathlib import Path

log_path = Path(sys.argv[1])
data = json.loads(log_path.read_text(encoding='utf-8', errors='replace'))
for item in data:
    if str(item.get('Environment', '')).lower() == 'production':
        source = (item.get('Source') or '').strip()
        if source:
            print(source)
            raise SystemExit(0)
raise SystemExit('NO_PRODUCTION_SOURCE')
PY
)"; then
    print_log_tail "$log_file" >&2
    rm -f "$log_file"
    return 1
  fi

  rm -f "$log_file"
  printf '%s\n' "$deployed_source"
}

HEAD_SHORT="$(git rev-parse --short HEAD)"
HEAD_FULL="$(git rev-parse HEAD)"
WORKTREE_DIRTY="false"
if [[ -n "$(git status --short --untracked-files=normal | head -n 1)" ]]; then
  WORKTREE_DIRTY="true"
fi

if [[ "$MODE" == "--predeploy-check" ]]; then
  run_predeploy_gate
  STAGED_DIR="$(stage_site_dir)"
  echo "PREDEPLOY_GATE_OK"
  echo "STAGED_DIR=$STAGED_DIR"
  echo "STAGED_FILE_COUNT=$(count_staged_files "$STAGED_DIR")"
  if [[ "$KEEP_STAGED_DIR" == "1" ]]; then
    echo "STAGED_DIR_PRESERVED=1"
  fi
  exit 0
fi

DEPLOYED_SOURCE="$(get_deployed_source)"

echo "DEPLOYED=$DEPLOYED_SOURCE HEAD=$HEAD_SHORT"

if is_deployed_head "$DEPLOYED_SOURCE"; then
  echo "ALREADY_UP_TO_DATE"
  exit 0
fi

if [[ "$MODE" == "--check" ]]; then
  echo "DEPLOY_REQUIRED"
  exit 0
fi

run_predeploy_gate
STAGED_DIR="$(stage_site_dir)"

echo "Deploying to CF Pages..."
DEPLOY_LOG="$(mktemp)"

if ! run_with_timeout \
  "$WRANGLER_DEPLOY_TIMEOUT" \
  "$DEPLOY_LOG" \
  npx wrangler pages deploy "$STAGED_DIR" \
    --project-name="$PROJECT_NAME" \
    --branch="$BRANCH" \
    --commit-hash="$HEAD_FULL" \
    --commit-dirty="$WORKTREE_DIRTY"; then
  print_log_tail "$DEPLOY_LOG" >&2

  POST_DEPLOYED_SOURCE="$(get_deployed_source || true)"
  rm -f "$DEPLOY_LOG"

  if [[ -n "$POST_DEPLOYED_SOURCE" ]] && is_deployed_head "$POST_DEPLOYED_SOURCE"; then
    echo "DEPLOYED_NEW=$HEAD_SHORT"
    exit 0
  fi

  exit 1
fi

print_log_tail "$DEPLOY_LOG"
rm -f "$DEPLOY_LOG"

echo "DEPLOYED_NEW=$HEAD_SHORT"
