#!/usr/bin/env bash
# LittleJS Game Production Pipeline
# Usage: ./pipeline.sh <slug> <title> [category] [emoji]
# Steps: validate → manifest → games-list → git commit
set -euo pipefail

GAMES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENGINE_DIR="$GAMES_DIR/_engine"
SLUG="${1:?Usage: pipeline.sh <slug> <title> [category] [emoji]}"
TITLE="${2:?Title required}"
CAT="${3:-arcade}"
EMOJI="${4:-🎮}"
GAME_DIR="$GAMES_DIR/$SLUG"
LIST="$GAMES_DIR/games-list.json"

echo "🔧 Pipeline: $SLUG ($TITLE)"

# Step 1: Validate
echo "── Step 1: Validate"
bash "$ENGINE_DIR/validate.sh" "$SLUG" || { echo "❌ Validation failed"; exit 1; }

# Step 2: Manifest
echo "── Step 2: Manifest"
bash "$ENGINE_DIR/manifest.sh" "$SLUG" "$TITLE"

# Step 3: Add to games-list.json
echo "── Step 3: games-list.json"
python3 "$ENGINE_DIR/add-to-list.py" "$SLUG" "$TITLE" "$CAT" "$EMOJI"

# Step 4: Summary
SIZE=$(wc -c < "$GAME_DIR/index.html")
echo ""
echo "✅ Pipeline complete: $SLUG"
echo "   Size: ${SIZE} bytes"
echo "   Path: $GAME_DIR/index.html"
echo "   List: $(python3 -c "import json; print(len(json.load(open('$LIST'))))" ) games total"
