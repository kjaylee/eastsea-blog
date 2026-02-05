#!/bin/bash
# eastsea-blog posts.json 자동 생성 스크립트
# 사용법: ./update-posts.sh

set -e

BLOG_DIR="/Users/kjaylee/.openclaw/workspace/eastsea-blog"
cd "$BLOG_DIR"

echo "📝 Generating posts.json..."

node << 'EOF'
const fs = require('fs');
const path = require('path');

const postsDir = '_posts';
const files = fs.readdirSync(postsDir)
  .filter(f => f.endsWith('.md'))
  .sort()
  .reverse();

const posts = files.map(filename => {
  const match = filename.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)\.md$/);
  if (!match) return null;
  
  const [, year, month, day, rest] = match;
  const date = `${year}-${month}-${day}`;
  
  const parts = rest.split('-');
  let category = 'journal';
  let slug = rest;
  
  if (['briefing', 'report', 'journal', 'digest'].includes(parts[0])) {
    category = parts[0];
    slug = rest;
  }
  
  const title = rest.split('-').map(w => 
    w.charAt(0).toUpperCase() + w.slice(1)
  ).join(' ');
  
  // Read first 200 chars for excerpt
  const content = fs.readFileSync(path.join(postsDir, filename), 'utf8');
  const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'));
  const excerpt = lines[0] ? lines[0].substring(0, 150) + '...' : 'Read more...';
  
  return { filename, date, category, title, slug, excerpt };
}).filter(p => p !== null);

fs.writeFileSync('posts.json', JSON.stringify(posts, null, 2));
console.log(`✅ Generated posts.json with ${posts.length} posts`);
EOF

echo "📦 Git add + commit + push..."
git add posts.json
git commit -m "chore: Update posts.json ($(date +%Y-%m-%d))" || echo "No changes to commit"
git push origin master

echo "✅ Done! Posts updated: $(cat posts.json | grep -c filename)"
