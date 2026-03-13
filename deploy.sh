#!/bin/bash
# eastsea-blog/deploy.sh — git push + CF Pages conditional deploy
set -euo pipefail
cd "$(dirname "$0")"
git push origin master 2>&1 | tail -3
bash scripts/cf-pages-auto-deploy.sh
