#!/bin/bash
# eastsea-blog/deploy.sh — git push + CF Pages 배포를 한 번에
set -e
cd "$(dirname "$0")"
git push origin master 2>&1 | tail -3
echo "Deploying to CF Pages..."
npx wrangler pages deploy . --project-name=eastsea-blog --branch=master --commit-hash=$(git rev-parse HEAD) 2>&1 | tail -3
echo "✅ Deploy complete"
