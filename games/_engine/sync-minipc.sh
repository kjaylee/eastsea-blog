#!/usr/bin/env bash
# Sync games-list.json to MiniPC (via GCP relay or direct)
# Usage: ./sync-minipc.sh
set -euo pipefail

MINIPC_HOST="${MINIPC_HOST:-<INTERNAL_IP>}"
GCP_RELAY_HOST="${GCP_RELAY_HOST:-<GCP_RELAY_HOST>}"

GAMES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LIST="$GAMES_DIR/games-list.json"
COUNT=$(python3 -c "import json; print(len(json.load(open('$LIST'))))")

echo "📡 Syncing games-list.json ($COUNT games) to MiniPC..."

# Method 1: Direct Tailscale
if ssh -o ConnectTimeout=5 spritz@${MINIPC_HOST} "echo ok" 2>/dev/null; then
  scp "$LIST" spritz@${MINIPC_HOST}:/var/www/games/games-list.json
  # Sync any new game dirs
  rsync -az --ignore-existing \
    --include '*/' --include '*/index.html' --include '*/manifest.webmanifest' --exclude '*' \
    --exclude '_engine/' \
    "$GAMES_DIR/" spritz@${MINIPC_HOST}:/var/www/games/ 2>/dev/null || true
  # Fix permissions
  ssh spritz@${MINIPC_HOST} "sudo chmod -R a+rX /var/www/games/ 2>/dev/null" || true
  echo "✅ Direct sync to MiniPC: $COUNT games"
  exit 0
fi

# Method 2: Via GCP relay
if ssh -o ConnectTimeout=5 -i ~/.ssh/google_compute_engine kjaylee@${GCP_RELAY_HOST} "echo ok" 2>/dev/null; then
  scp -i ~/.ssh/google_compute_engine "$LIST" kjaylee@${GCP_RELAY_HOST}:/tmp/games-list.json
  ssh -i ~/.ssh/google_compute_engine kjaylee@${GCP_RELAY_HOST} "sudo cp /tmp/games-list.json /home/k_jaylee/spritz/static/eastsea-xyz/games-list.json 2>/dev/null || true"
  echo "✅ GCP relay sync: $COUNT games"
  exit 0
fi

echo "⚠️  Could not reach MiniPC or GCP. Manual sync needed."
exit 1
