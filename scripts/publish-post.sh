#!/bin/bash
# 단일 포스트를 posts/_posts에 미러링하고 blog-api D1에 업서트한다.
set -euo pipefail

BLOG_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SLUG="${1:-}"

if [ -z "$SLUG" ]; then
  echo "Usage: $0 YYYY-MM-DD-slug" >&2
  exit 1
fi

SLUG="${SLUG%.md}"
SRC="$BLOG_DIR/posts/$SLUG.md"
DST="$BLOG_DIR/_posts/$SLUG.md"

if [ ! -f "$SRC" ]; then
  echo "ERROR: source post not found: $SRC" >&2
  exit 1
fi

cp "$SRC" "$DST"
echo "Mirrored: $SRC -> $DST"

TOKEN_FILE="$BLOG_DIR/../secrets/blog-api-token.txt"
if [ ! -r "$TOKEN_FILE" ]; then
  echo "ERROR: blog API token not found: $TOKEN_FILE" >&2
  exit 1
fi

BLOG_API_TOKEN="$(tr -d '\r\n' < "$TOKEN_FILE")" \
  python3 "$BLOG_DIR/scripts/publish-post-to-d1.py" "$SRC"

echo "Published: $SLUG"
