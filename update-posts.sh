#!/bin/bash
# eastsea-blog posts.json 자동 생성 스크립트
# 사용법: ./update-posts.sh

set -e

BLOG_DIR="$(cd "$(dirname "$0")" && pwd)"
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
  
  // Read content
  const content = fs.readFileSync(path.join(postsDir, filename), 'utf8');
  let lines = content.split('\n');
  
  // Parse front matter - handle both simple and array formats
  let frontMatter = {};
  let inFrontMatter = false;
  let frontMatterCount = 0;
  const contentLines = [];
  
  for (const line of lines) {
    if (line.trim() === '---') {
      frontMatterCount++;
      if (frontMatterCount === 1) {
        inFrontMatter = true;
      } else if (frontMatterCount === 2) {
        inFrontMatter = false;
      }
      continue;
    }
    
    if (inFrontMatter) {
      // Parse YAML front matter (handle both simple and array)
      const fmMatch = line.match(/^(\w+):\s*(.+)$/);
      if (fmMatch) {
        const [, key, value] = fmMatch;
        // Remove quotes and brackets
        frontMatter[key] = value.replace(/^["'\[]|["'\]]$/g, '').split(',')[0].trim();
      }
    } else if (frontMatterCount >= 2) {
      contentLines.push(line);
    }
  }
  
  // Detect category with more granularity
  let category = 'other'; // default
  
  // Check front matter first
  if (frontMatter.categories) {
    const cats = frontMatter.categories.toLowerCase();
    if (cats.includes('briefing')) category = 'briefing';
    else if (cats.includes('digest')) category = 'digest';
    else if (cats.includes('report')) category = 'report';
    else if (cats.includes('diary') || cats.includes('journal')) category = 'journal';
    else if (cats.includes('research')) category = 'research';
  }
  
  // If not found in front matter, check filename
  if (category === 'other') {
    if (rest.includes('briefing')) category = 'briefing';
    else if (rest.includes('digest')) category = 'digest';
    else if (rest.includes('report')) category = 'report';
    else if (rest.includes('diary')) category = 'journal';
    else if (rest.includes('polish')) category = 'polish';
    else if (rest.includes('upgrade')) category = 'upgrade';
    else if (rest.includes('research')) category = 'research';
  }
  
  // Use front matter title if available
  let title = frontMatter.title || rest.split('-').map(w => 
    w.charAt(0).toUpperCase() + w.slice(1)
  ).join(' ');
  
  // Get first meaningful paragraph (skip headers and short lines)
  const meaningfulLines = contentLines
    .map(l => l.trim())
    .filter(l => {
      // Skip empty, headers, hr, and very short lines
      if (!l || l.startsWith('#') || l === '---' || l.length < 30) return false;
      // Skip lines that look like metadata
      if (l.match(/^(layout|title|date|categories|tags):/)) return false;
      return true;
    });
  
  // Get first paragraph or blockquote
  let excerpt = '더 읽기...';
  for (const line of meaningfulLines) {
    if (line.startsWith('>')) {
      excerpt = line.substring(1).trim();
      break;
    } else if (line.length > 30) {
      excerpt = line;
      break;
    }
  }
  
  // Clean up and truncate
  excerpt = excerpt
    .substring(0, 120)
    .replace(/[*_`\[\]]/g, '')
    .trim() + '...';
  
  return { filename, date, category, title, excerpt };
}).filter(p => p !== null);

fs.writeFileSync('posts.json', JSON.stringify(posts, null, 2));
console.log(`✅ Generated posts.json with ${posts.length} posts`);

// Category stats
const stats = posts.reduce((acc, p) => {
  acc[p.category] = (acc[p.category] || 0) + 1;
  return acc;
}, {});
console.log('📊 Categories:', JSON.stringify(stats, null, 4));
EOF

echo "📦 Git add + commit + push..."
git add posts.json
git commit -m "chore: Update posts.json ($(date +%Y-%m-%d))" || echo "No changes to commit"
git push origin master

echo "✅ Done! Posts updated: $(cat posts.json | grep -c filename)"
