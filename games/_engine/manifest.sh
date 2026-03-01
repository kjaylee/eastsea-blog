#!/usr/bin/env bash
# Generate manifest.webmanifest for a game
# Usage: ./manifest.sh <slug> <title>
set -euo pipefail

GAMES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SLUG="${1:?Usage: manifest.sh <slug> <title>}"
TITLE="${2:?Title required}"
SHORT=$(echo "$TITLE" | cut -c1-12)
OUT="$GAMES_DIR/$SLUG/manifest.webmanifest"

cat > "$OUT" <<EOF
{
  "name": "$TITLE",
  "short_name": "$SHORT",
  "start_url": "./",
  "display": "standalone",
  "background_color": "#0a0a1a",
  "theme_color": "#0a0a1a",
  "icons": []
}
EOF

echo "✓ Manifest: $OUT"
