#!/bin/bash
# Check current CF Pages production deployment and deploy only when HEAD differs.
set -euo pipefail

cd "$(dirname "$0")/.."

PROJECT_NAME="${CF_PAGES_PROJECT_NAME:-eastsea-blog}"
BRANCH="${CF_PAGES_BRANCH:-master}"
MODE="${1:-}"
WRANGLER_LIST_TIMEOUT="${CF_PAGES_LIST_TIMEOUT:-30}"
WRANGLER_DEPLOY_TIMEOUT="${CF_PAGES_DEPLOY_TIMEOUT:-210}"
LOG_TAIL_LINES="${CF_PAGES_LOG_TAIL_LINES:-20}"

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
            stderr=subprocess.STDOUT,
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

echo "Deploying to CF Pages..."
DEPLOY_LOG="$(mktemp)"

if ! run_with_timeout \
  "$WRANGLER_DEPLOY_TIMEOUT" \
  "$DEPLOY_LOG" \
  npx wrangler pages deploy . \
    --project-name="$PROJECT_NAME" \
    --branch="$BRANCH" \
    --commit-hash="$HEAD_FULL"; then
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
