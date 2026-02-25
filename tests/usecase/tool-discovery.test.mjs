import test from 'node:test';
import assert from 'node:assert/strict';
import { fileExists, listSubdirs, readJSON, readText } from '../setup.mjs';

const manifest = readJSON('tools/manifest.json');
const tools = Array.isArray(manifest.tools) ? manifest.tools : [];
const toolDirs = listSubdirs('tools');

test('tc_uE_01_tools_manifest_has_valid_structure', () => {
  assert.ok(manifest && typeof manifest === 'object');
  assert.ok(Array.isArray(manifest.tools));
  assert.ok(tools.length > 0);
});

test('tc_uE_02_each_tool_has_slug_title_url_and_size', () => {
  for (const tool of tools) {
    assert.ok(typeof tool.slug === 'string' && tool.slug.length > 0);
    assert.ok(typeof tool.title === 'string');
    assert.ok(typeof tool.url === 'string' && tool.url.length > 0);
    assert.ok(Number.isInteger(tool.size));
  }
});

test('tc_uE_03_each_tool_directory_has_index_html', () => {
  for (const tool of tools) {
    assert.ok(fileExists(`tools/${tool.slug}/index.html`), `missing index.html for ${tool.slug}`);
  }
});

test('tc_uE_04_tool_titles_are_non_empty', () => {
  for (const tool of tools) {
    assert.ok(tool.title.trim().length > 0, `empty title: ${tool.slug}`);
  }
});

test('tc_uE_05_tool_urls_follow_tools_slug_pattern', () => {
  for (const tool of tools) {
    assert.equal(tool.url, `/tools/${tool.slug}/`);
  }
});

test('tc_uE_06_tool_sizes_are_positive_integers', () => {
  for (const tool of tools) {
    assert.ok(Number.isInteger(tool.size) && tool.size > 0, `invalid size for ${tool.slug}: ${tool.size}`);
  }
});

test('tc_uE_07_no_duplicate_tool_slugs', () => {
  const slugs = tools.map((tool) => tool.slug);
  const unique = new Set(slugs);
  assert.equal(unique.size, slugs.length);
});

test('tc_uE_08_sample_tool_html_contains_title_tag', () => {
  const sample = tools.slice(0, 10);
  for (const tool of sample) {
    const html = readText(`tools/${tool.slug}/index.html`);
    assert.match(html, /<title>[^<]+<\/title>/i, `missing <title> in ${tool.slug}`);
    assert.ok(/<style|<link\s+[^>]*rel=["']stylesheet["']/i.test(html), `missing style/link in ${tool.slug}`);
  }

  // Keep one extra sanity check for directories discovered on filesystem.
  assert.ok(toolDirs.length >= tools.length);
});
