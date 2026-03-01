#!/usr/bin/env bash
# Sync games-list.json to MiniPC (via GCP relay or direct)
# Usage: ./sync-minipc.sh
set -euo pipefail

GAMES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LIST="$GAMES_DIR/games-list.json"
COUNT=$(python3 -c "import json; print(len(json.load(open('$LIST'))))")

echo "📡 Syncing games-list.json ($COUNT games) to MiniPC..."

# Method 1: Direct Tailscale
if ssh -o ConnectTimeout=5 spritz@100.80.169.94 "echo ok" 2>/dev/null; then
  scp "$LIST" spritz@100.80.169.94:/var/www/games/games-list.json
  echo "✅ Direct sync to MiniPC: $COUNT games"
  exit 0
fi

# Method 2: Via GCP relay
if ssh -o ConnectTimeout=5 -i ~/.ssh/google_compute_engine kjaylee@34.19.69.41 "echo ok" 2>/dev/null; then
  scp -i ~/.ssh/google_compute_engine "$LIST" kjaylee@34.19.69.41:/tmp/games-list.json
  ssh -i ~/.ssh/google_compute_engine kjaylee@34.19.69.41 "sudo cp /tmp/games-list.json /home/k_jaylee/spritz/static/eastsea-xyz/games-list.json 2>/dev/null || true"
  echo "✅ GCP relay sync: $COUNT games"
  exit 0
fi

echo "⚠️  Could not reach MiniPC or GCP. Manual sync needed."
exit 1
