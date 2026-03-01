#!/usr/bin/env bash
# Git add, commit, push new games
# Usage: ./git-push.sh "commit message"
set -euo pipefail

BLOG_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
MSG="${1:-feat: add new LittleJS games}"

cd "$BLOG_DIR"

# Add games directory changes
git add games/

# Check if there are changes to commit
if git diff --cached --quiet; then
  echo "⚡ No changes to commit"
  exit 0
fi

COUNT=$(git diff --cached --name-only | grep -c 'games/' || true)
git commit -m "$MSG"
git push origin master

echo "✅ Pushed: $COUNT file(s) — $MSG"
