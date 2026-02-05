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
  
  // Detect category from filename (search for keywords anywhere)
  let category = 'journal'; // default
  if (rest.includes('briefing')) category = 'briefing';
  else if (rest.includes('digest')) category = 'digest';
  else if (rest.includes('report')) category = 'report';
  else if (rest.includes('diary')) category = 'journal';
  
  // Convert slug to title
  const title = rest.split('-').map(w => 
    w.charAt(0).toUpperCase() + w.slice(1)
  ).join(' ');
  
  // Read content and skip front matter
  const content = fs.readFileSync(path.join(postsDir, filename), 'utf8');
  let lines = content.split('\n');
  
  // Remove front matter (between --- and ---)
  let inFrontMatter = false;
  let frontMatterEnded = false;
  const contentLines = [];
  
  for (const line of lines) {
    if (line.trim() === '---') {
      if (!frontMatterEnded) {
        inFrontMatter = !inFrontMatter;
        if (!inFrontMatter) frontMatterEnded = true;
      }
      continue;
    }
    if (!inFrontMatter && frontMatterEnded) {
      contentLines.push(line);
    }
  }
  
  // Get first meaningful line for excerpt
  const meaningfulLines = contentLines
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'));
  
  const excerpt = meaningfulLines[0] 
    ? meaningfulLines[0].substring(0, 150).replace(/[*_]/g, '') + '...'
    : '더 읽기...';
  
  return { filename, date, category, title, excerpt };
}).filter(p => p !== null);

fs.writeFileSync('posts.json', JSON.stringify(posts, null, 2));
console.log(`✅ Generated posts.json with ${posts.length} posts`);

// Category stats
const stats = posts.reduce((acc, p) => {
  acc[p.category] = (acc[p.category] || 0) + 1;
  return acc;
}, {});
console.log('📊 Categories:', JSON.stringify(stats));
EOF

echo "📦 Git add + commit + push..."
git add posts.json
git commit -m "chore: Update posts.json ($(date +%Y-%m-%d))" || echo "No changes to commit"
git push origin master

echo "✅ Done! Posts updated: $(cat posts.json | grep -c filename)"
