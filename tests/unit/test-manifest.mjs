import test from 'node:test';
import assert from 'node:assert/strict';
import { fileExists, readJSON } from '../setup.mjs';

const manifest = readJSON('tools/manifest.json');
const tools = manifest.tools;

test('tc_manifest_01_has_tools_array', () => {
  assert.equal(typeof manifest, 'object');
  assert.ok(Array.isArray(tools));
  assert.ok(tools.length > 0);
});

test('tc_manifest_02_required_fields_exist', () => {
  for (const tool of tools) {
    assert.equal(typeof tool.slug, 'string');
    assert.equal(typeof tool.title, 'string');
    assert.equal(typeof tool.url, 'string');
    assert.equal(typeof tool.size, 'number');

    assert.ok(tool.slug.length > 0);
    assert.ok(tool.title.trim().length > 0);
  }
});

test('tc_manifest_03_slug_is_unique', () => {
  const seen = new Set();
  for (const tool of tools) {
    assert.ok(!seen.has(tool.slug), `Duplicate tool slug: ${tool.slug}`);
    seen.add(tool.slug);
  }
});

test('tc_manifest_04_url_matches_slug', () => {
  for (const tool of tools) {
    assert.equal(tool.url, `/tools/${tool.slug}/`, `Unexpected url for ${tool.slug}`);
  }
});

test('tc_manifest_05_manifest_entries_have_real_index_file', () => {
  for (const tool of tools) {
    assert.ok(fileExists(`tools/${tool.slug}/index.html`), `Missing tools/${tool.slug}/index.html`);
  }
});

test('tc_manifest_06_size_is_non_negative_number', () => {
  for (const tool of tools) {
    assert.ok(Number.isFinite(tool.size), `size is not finite: ${tool.slug}`);
    assert.ok(tool.size >= 0, `size is negative: ${tool.slug}`);
  }
});
