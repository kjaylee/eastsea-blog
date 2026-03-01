#!/usr/bin/env bash
# Run pipeline for multiple games at once
# Usage: ./batch.sh
# Reads from stdin or processes all games in $GAMES_DIR that have index.html but no manifest
set -euo pipefail

GAMES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENGINE_DIR="$GAMES_DIR/_engine"
PROCESSED=0
FAILED=0

echo "🔄 Batch Pipeline"
echo ""

for dir in "$GAMES_DIR"/*/; do
  slug=$(basename "$dir")
  [ "$slug" = "_engine" ] && continue
  [ ! -f "$dir/index.html" ] && continue

  # Check if already validated (has manifest)
  if [ -f "$dir/manifest.webmanifest" ]; then
    continue
  fi

  # Extract title from HTML <title> tag
  TITLE=$(grep -oPm1 '(?<=<title>)[^<]+' "$dir/index.html" 2>/dev/null || echo "$slug")

  echo "━━━ $slug: $TITLE"
  if bash "$ENGINE_DIR/pipeline.sh" "$slug" "$TITLE" 2>&1; then
    PROCESSED=$((PROCESSED + 1))
  else
    FAILED=$((FAILED + 1))
  fi
  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Processed: $PROCESSED"
echo "❌ Failed: $FAILED"
