/**
 * eastsea-blog Test Setup — Common utilities for all test categories.
 * Uses Node.js built-in test runner (node:test + node:assert).
 * No external dependencies required.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const BLOG_ROOT = resolve(__dirname, '..');

// ─── File helpers ───

export function readJSON(relPath) {
  const abs = join(BLOG_ROOT, relPath);
  return JSON.parse(readFileSync(abs, 'utf8'));
}

export function readText(relPath) {
  const abs = join(BLOG_ROOT, relPath);
  return readFileSync(abs, 'utf8');
}

export function fileExists(relPath) {
  return existsSync(join(BLOG_ROOT, relPath));
}

export function listDir(relPath) {
  const abs = join(BLOG_ROOT, relPath);
  if (!existsSync(abs)) return [];
  return readdirSync(abs);
}

export function listSubdirs(relPath) {
  const abs = join(BLOG_ROOT, relPath);
  if (!existsSync(abs)) return [];
  return readdirSync(abs).filter(name => {
    try {
      return statSync(join(abs, name)).isDirectory();
    } catch { return false; }
  });
}

export function fileSize(relPath) {
  const abs = join(BLOG_ROOT, relPath);
  return statSync(abs).size;
}

// ─── JS function extraction helpers ───

/**
 * Extract and evaluate the NovelsApp IIFE from novels/app.js.
 * Returns the NovelsApp object with its pure functions.
 */
export function loadNovelsApp() {
  const src = readText('novels/app.js');
  // The IIFE sets window.NovelsApp. We simulate a minimal window + document + localStorage.
  const window = {
    NovelsApp: null,
  };
  const localStorage = {
    _store: {},
    getItem(k) { return this._store[k] ?? null; },
    setItem(k, v) { this._store[k] = String(v); },
    removeItem(k) { delete this._store[k]; },
  };
  const document = {
    documentElement: { classList: { toggle() {}, add() {}, remove() {} } },
  };
  // Execute in a Function sandbox
  const fn = new Function('window', 'document', 'localStorage', src + '\nreturn window.NovelsApp;');
  return fn(window, document, localStorage);
}

/**
 * Extract parseFrontMatter and formatDate from view.html inline script.
 */
export function loadViewHelpers() {
  const html = readText('view.html');

  // Extract the <script> block that contains parseFrontMatter
  const scriptMatch = html.match(/<script>\s*\n\s*marked\.setOptions[\s\S]*?<\/script>/);
  if (!scriptMatch) throw new Error('Could not find view.html inline script');

  let scriptBody = scriptMatch[0]
    .replace(/^<script>/, '')
    .replace(/<\/script>$/, '');

  // Remove DOM-dependent code (loadPost, loadSidebar, generateTOC, event listeners)
  // Keep only the pure functions
  const pureFunctions = {};

  // parseFrontMatter
  {
    const match = scriptBody.match(/function parseFrontMatter\(markdown\)\s*\{[\s\S]*?\n\}/);
    if (match) {
      const fn = new Function('markdown', match[0].replace(/^function parseFrontMatter\(markdown\)\s*\{/, '').replace(/\}$/, ''));
      pureFunctions.parseFrontMatter = new Function('markdown', `
        ${match[0]}
        return parseFrontMatter(markdown);
      `);
    }
  }

  // formatDate
  {
    const match = scriptBody.match(/function formatDate\(dateString\)\s*\{[\s\S]*?\n\}/);
    if (match) {
      pureFunctions.formatDate = new Function('dateString', `
        ${match[0]}
        return formatDate(dateString);
      `);
    }
  }

  // createMetaSection
  {
    const match = scriptBody.match(/function createMetaSection\(frontMatter\)\s*\{[\s\S]*?\n\}/);
    if (match) {
      pureFunctions.createMetaSection = new Function('frontMatter', `
        ${match[0]}
        return createMetaSection(frontMatter);
      `);
    }
  }

  return pureFunctions;
}

/**
 * Extract the posts.json generation logic from update-posts.sh.
 * Returns a function that processes a single file's content.
 */
export function loadPostsJsonGenerator() {
  // The logic from update-posts.sh is a Node script. We extract the per-file processing.
  return {
    /**
     * Detect category from filename and front matter (mirrors update-posts.sh logic).
     */
    detectCategory(filename, frontMatterCategories) {
      let category = 'other';

      // Check front matter first
      if (frontMatterCategories) {
        const cats = String(frontMatterCategories).toLowerCase();
        if (cats.includes('briefing')) category = 'briefing';
        else if (cats.includes('digest')) category = 'digest';
        else if (cats.includes('report')) category = 'report';
        else if (cats.includes('diary') || cats.includes('journal')) category = 'journal';
        else if (cats.includes('research')) category = 'research';
      }

      // If not found in front matter, check filename
      if (category === 'other') {
        const rest = filename.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
        if (rest.includes('briefing')) category = 'briefing';
        else if (rest.includes('digest')) category = 'digest';
        else if (rest.includes('report')) category = 'report';
        else if (rest.includes('diary')) category = 'journal';
        else if (rest.includes('polish')) category = 'polish';
        else if (rest.includes('upgrade')) category = 'upgrade';
        else if (rest.includes('research')) category = 'research';
      }

      return category;
    },

    /**
     * Parse simple YAML front matter.
     */
    parseFrontMatter(content) {
      const lines = content.split('\n');
      const fm = {};
      let inFM = false;
      let fmCount = 0;

      for (const line of lines) {
        if (line.trim() === '---') {
          fmCount++;
          if (fmCount === 1) inFM = true;
          else if (fmCount === 2) inFM = false;
          continue;
        }
        if (inFM) {
          const match = line.match(/^(\w+):\s*(.+)$/);
          if (match) {
            fm[match[1]] = match[2].replace(/^["'\[]|["'\]]$/g, '').split(',')[0].trim();
          }
        }
      }
      return fm;
    },

    /**
     * Extract excerpt from markdown content (skipping front matter, headers, short lines).
     */
    extractExcerpt(content) {
      const lines = content.split('\n');
      let pastFM = false;
      let fmCount = 0;
      const contentLines = [];

      for (const line of lines) {
        if (line.trim() === '---') {
          fmCount++;
          if (fmCount === 2) pastFM = true;
          continue;
        }
        if (pastFM) contentLines.push(line);
      }

      const meaningful = contentLines
        .map(l => l.trim())
        .filter(l => {
          if (!l || l.startsWith('#') || l === '---' || l.length < 30) return false;
          if (l.match(/^(layout|title|date|categories|tags):/)) return false;
          return true;
        });

      let excerpt = '더 읽기...';
      for (const line of meaningful) {
        if (line.startsWith('>')) {
          excerpt = line.substring(1).trim();
          break;
        } else if (line.length > 30) {
          excerpt = line;
          break;
        }
      }

      return excerpt.substring(0, 120).replace(/[*_`\[\]]/g, '').trim() + '...';
    }
  };
}

/**
 * Extract visit-counter.js pure functions.
 */
export function loadVisitCounter() {
  return {
    normalizePath(value) {
      if (!value) return '/';
      let cleaned = value.trim();
      if (!cleaned.startsWith('/')) cleaned = `/${cleaned}`;
      return cleaned;
    },

    createVisitorId() {
      return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    }
  };
}
