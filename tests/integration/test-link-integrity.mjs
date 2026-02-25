import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { BLOG_ROOT, fileExists, readJSON, readText } from '../setup.mjs';

const htmlFiles = [
  'index.html',
  'about.html',
  'contact.html',
  'privacy.html',
  'terms.html',
  'hotdeal/index.html',
  'tools/index.html',
  'games/index.html',
  'novels/index.html',
];

const docs = htmlFiles.map((path) => ({ path, html: readText(path) }));

function isExternal(ref) {
  return /^(https?:|mailto:|tel:|javascript:|data:)/i.test(ref);
}

function normalizeRef(ref) {
  const withoutHash = ref.split('#')[0];
  const withoutQuery = withoutHash.split('?')[0];
  return withoutQuery.trim();
}

function resolveRef(fromFile, ref) {
  const clean = normalizeRef(ref);
  if (!clean || clean === '#') return null;
  if (isExternal(clean)) return null;

  if (clean === '/') return join(BLOG_ROOT, 'index.html');
  if (clean.startsWith('/')) return join(BLOG_ROOT, clean.slice(1));
  return join(BLOG_ROOT, dirname(fromFile), clean);
}

function targetExists(targetPath) {
  if (!targetPath) return true;
  if (!existsSync(targetPath)) return false;
  const stat = statSync(targetPath);
  if (stat.isDirectory()) return existsSync(join(targetPath, 'index.html'));
  return true;
}

function collectAttr(html, attr) {
  const re = new RegExp(`${attr}=["']([^"']+)["']`, 'gi');
  return [...html.matchAll(re)].map((m) => m[1]);
}

test('tc_link_integrity_01_selected_html_files_exist', () => {
  for (const file of htmlFiles) {
    assert.ok(fileExists(file), `Missing HTML file: ${file}`);
  }
});

test('tc_link_integrity_02_href_internal_links_are_resolvable', () => {
  const broken = [];

  for (const { path, html } of docs) {
    const hrefs = collectAttr(html, 'href');
    for (const href of hrefs) {
      const target = resolveRef(path, href);
      if (!targetExists(target)) broken.push(`${path} -> ${href}`);
    }
  }

  assert.deepEqual(broken, []);
});

test('tc_link_integrity_03_src_internal_resources_are_resolvable', () => {
  const broken = [];

  for (const { path, html } of docs) {
    const srcs = collectAttr(html, 'src');
    for (const src of srcs) {
      const target = resolveRef(path, src);
      if (!targetExists(target)) broken.push(`${path} -> ${src}`);
    }
  }

  assert.deepEqual(broken, []);
});

test('tc_link_integrity_04_manifest_urls_point_to_real_pages', () => {
  const tools = readJSON('tools/manifest.json').tools;
  const games = readJSON('games/manifest.json').games;

  for (const tool of tools.slice(0, 50)) {
    // sample subset for fast integration check
    const target = join(BLOG_ROOT, tool.url.slice(1), 'index.html');
    assert.ok(existsSync(target), `Broken tool URL: ${tool.url}`);
  }

  for (const game of games) {
    const target = join(BLOG_ROOT, game.url.slice(1), 'index.html');
    assert.ok(existsSync(target), `Broken game URL: ${game.url}`);
  }
});
