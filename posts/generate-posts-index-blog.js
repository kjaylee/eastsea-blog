#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Paths (absolute to avoid symlink issues)
const workspaceDir = '/Users/kjaylee/.openclaw/workspace';
const postsSourceDir = path.join(workspaceDir, 'posts');
const postsTargetDir = path.join(workspaceDir, 'posts');
const outputPath = path.join(workspaceDir, 'posts-index.json');

// Simple front matter parser
function parseFrontMatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  
  if (!match) {
    return { metadata: {}, content };
  }

  const [, frontMatter, bodyContent] = match;
  const metadata = {};

  frontMatter.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();
      
      // Remove quotes
      value = value.replace(/^["']|["']$/g, '');
      
      // Handle arrays (tags)
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      }
      
      metadata[key] = value;
    }
  });

  return { metadata, content: bodyContent };
}

// Generate excerpt from content
function generateExcerpt(content, maxLength = 200) {
  // Remove markdown formatting
  let text = content
    .replace(/^#+\s+/gm, '') // Headers
    .replace(/\*\*(.+?)\*\*/g, '$1') // Bold
    .replace(/\*(.+?)\*/g, '$1') // Italic
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Links
    .replace(/`(.+?)`/g, '$1') // Code
    .replace(/^\s*[-*+]\s+/gm, '') // Lists
    .replace(/^\s*\d+\.\s+/gm, '') // Numbered lists
    .replace(/\n+/g, ' ') // Newlines
    .trim();

  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

// Main function
async function generatePostsIndex() {
  console.log('🔍 Scanning posts directory...');
  
  if (!fs.existsSync(postsSourceDir)) {
    console.error(`❌ Source directory not found: ${postsSourceDir}`);
    process.exit(1);
  }

  // Ensure target posts directory exists
  if (!fs.existsSync(postsTargetDir)) {
    fs.mkdirSync(postsTargetDir, { recursive: true });
    console.log(`📁 Created posts directory: ${postsTargetDir}`);
  }

  const files = fs.readdirSync(postsSourceDir)
    .filter(file => file.endsWith('.md'))
    .sort()
    .reverse(); // Newest first

  console.log(`📄 Found ${files.length} markdown files`);

  const posts = [];
  let copiedCount = 0;

  for (const file of files) {
    try {
      const sourcePath = path.join(postsSourceDir, file);
      const content = fs.readFileSync(sourcePath, 'utf-8');
      const { metadata, content: bodyContent } = parseFrontMatter(content);

      // Extract slug from filename
      const slug = file.replace('.md', '');

      // Generate excerpt if not provided
      const excerpt = metadata.excerpt || metadata.description || generateExcerpt(bodyContent);

      // Build post metadata
      const postMeta = {
        title: metadata.title || slug,
        date: metadata.date || extractDateFromSlug(slug),
        slug: slug,
        tags: Array.isArray(metadata.tags) ? metadata.tags : [],
        category: metadata.category || inferCategory(metadata.tags, slug),
        excerpt: excerpt
      };

      posts.push(postMeta);

      // Copy file to posts directory
      const targetPath = path.join(postsTargetDir, file);
      fs.copyFileSync(sourcePath, targetPath);
      copiedCount++;

    } catch (error) {
      console.error(`⚠️  Error processing ${file}:`, error.message);
    }
  }

  // Sort by date (newest first)
  posts.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA;
  });

  // Write index
  fs.writeFileSync(outputPath, JSON.stringify(posts, null, 2));

  console.log(`\n✅ Generated posts-index.json`);
  console.log(`📊 Total posts: ${posts.length}`);
  console.log(`📋 Copied files: ${copiedCount}`);
  console.log(`📍 Output: ${outputPath}`);

  // Print category summary
  const categoryCounts = {};
  posts.forEach(post => {
    categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1;
  });

  console.log('\n📂 Categories:');
  Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count}`);
    });

  // Print tag summary
  const tagCounts = {};
  posts.forEach(post => {
    post.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  console.log('\n🏷️  Top tags:');
  Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([tag, count]) => {
      console.log(`   #${tag}: ${count}`);
    });
}

// Extract date from slug (format: YYYY-MM-DD-title)
function extractDateFromSlug(slug) {
  const match = slug.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return new Date().toISOString().split('T')[0];
}

// Infer category from tags or slug
function inferCategory(tags, slug) {
  if (!Array.isArray(tags)) return 'uncategorized';
  
  const tagStr = tags.join(' ').toLowerCase();
  const slugLower = slug.toLowerCase();

  if (tagStr.includes('briefing') || slugLower.includes('briefing')) return 'briefing';
  if (tagStr.includes('diary') || slugLower.includes('diary')) return 'diary';
  if (tagStr.includes('tutorial') || slugLower.includes('tutorial')) return 'tutorial';
  if (tagStr.includes('research') || slugLower.includes('research')) return 'research';
  if (tagStr.includes('game') || slugLower.includes('game')) return 'games';
  if (tagStr.includes('novel') || tagStr.includes('소설') || slugLower.includes('novel')) return 'novels';

  return 'uncategorized';
}

// Run
generatePostsIndex().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
