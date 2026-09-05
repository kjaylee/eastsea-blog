#!/usr/bin/env bash
# d1-sync-audit.sh — D1 전수 대조 + 누락 백필 (2026-09-05, diary 017 다짐 이행)
# 용법: bash scripts/d1-sync-audit.sh [YYYY-MM-DD]  (인자 없으면 오늘)
# 종료코드: 0 = 전부 200, 1 = 백필 후에도 실패 존재
set -euo pipefail
cd "$(dirname "$0")/.."

DAY="${1:-$(date +%Y-%m-%d)}"
: "${BLOG_API_TOKEN:?BLOG_API_TOKEN not set}"
API="https://blog-api.k-jaylee.workers.dev/api/posts"

MISSING=0; FIXED=0; FAILED=0
for f in _posts/"$DAY"-*.md; do
  [ -f "$f" ] || { echo "NO_POSTS:$DAY"; exit 0; }
  slug=$(basename "$f" .md)
  code=$(curl -s -o /dev/null -w '%{http_code}' "$API/$slug")
  if [ "$code" = "200" ]; then
    echo "OK   $slug"
  else
    echo "MISS $slug (api:$code) → backfill"
    MISSING=$((MISSING+1))
    python3 scripts/publish-post-to-d1.py "$f" >/dev/null 2>&1 || true
    vcode=$(curl -s -o /dev/null -w '%{http_code}' "$API/$slug")
    if [ "$vcode" = "200" ]; then
      echo "FIXED $slug (201→200)"
      FIXED=$((FIXED+1))
    else
      echo "FAIL $slug (still $vcode)"
      FAILED=$((FAILED+1))
    fi
  fi
done
echo "SUMMARY day=$DAY total_ok=$(( $(ls _posts/"$DAY"-*.md | wc -l) - MISSING )) miss=$MISSING fixed=$FIXED failed=$FAILED"
[ "$FAILED" -eq 0 ]
