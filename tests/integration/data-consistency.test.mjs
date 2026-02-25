import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { BLOG_ROOT, readJSON, listDir } from '../setup.mjs';

const posts = readJSON('posts.json');
const novelsManifest = readJSON('novels/manifest.json');
const toolsManifest = readJSON('tools/manifest.json');

const hotdealListFiles = [
  'hotdeal/data/deals.json',
  'hotdeal/data/popular.json',
  'hotdeal/data/free.json',
  'hotdeal/data/lowest.json',
  'hotdeal/data/korean.json',
  'hotdeal/data/top_rated.json',
];

const jsonFilesForValidation = [
  '_data/strapi-articles.json',
  '_data/tools-list.json',
  'games/manifest.json',
  'hotdeal/data/deals.json',
  'hotdeal/data/free.json',
  'hotdeal/data/korean.json',
  'hotdeal/data/lowest.json',
  'hotdeal/data/meta.json',
  'hotdeal/data/popular.json',
  'hotdeal/data/price_history.json',
  'hotdeal/data/top_rated.json',
  'novels/manifest.json',
  'posts.json',
  'tools/manifest.json',
];

test('tc_iE_01_posts_dates_match_filename_date_prefix', () => {
  for (const post of posts) {
    assert.match(
      post.filename,
      /^\d{4}-\d{2}-\d{2}-.+\.md$/,
      `posts.json filename does not follow YYYY-MM-DD-*.md: ${post.filename}`,
    );

    const datePrefix = post.filename.slice(0, 10);
    assert.equal(
      post.date,
      datePrefix,
      `posts.json date mismatch for ${post.filename}: date=${post.date}, prefix=${datePrefix}`,
    );
  }
});

test('tc_iE_02_novel_episode_counts_match_actual_data_files', () => {
  const episodeFiles = listDir('novels/_data').filter(name => name.endsWith('.md'));

  for (const novel of novelsManifest.novels) {
    const actualCount = episodeFiles.filter(name => name.startsWith(`${novel.slug}-`)).length;
    const expectedCount = novel.episodes.length;

    assert.equal(
      actualCount,
      expectedCount,
      `Novel ${novel.slug} episode count mismatch: manifest=${expectedCount}, files=${actualCount}`,
    );
  }
});

test('tc_iE_03_hotdeal_data_files_have_array_of_objects_structure', () => {
  for (const relPath of hotdealListFiles) {
    const data = readJSON(relPath);

    assert.ok(Array.isArray(data), `${relPath} must be an array`);
    for (let i = 0; i < data.length; i += 1) {
      const item = data[i];
      assert.ok(
        item && typeof item === 'object' && !Array.isArray(item),
        `${relPath}[${i}] must be an object`,
      );
    }
  }
});

test('tc_iE_04_tool_manifest_sizes_are_within_reasonable_range', () => {
  const MIN_SIZE = 500;
  const MAX_SIZE = 1024 * 1024;

  for (const tool of toolsManifest.tools) {
    assert.ok(
      Number.isFinite(tool.size) && tool.size >= MIN_SIZE && tool.size <= MAX_SIZE,
      `Invalid size for tool ${tool.slug}: ${tool.size} (expected ${MIN_SIZE}-${MAX_SIZE} bytes)`,
    );
  }
});

test('tc_iE_05_all_json_files_parse_without_encoding_or_syntax_errors', () => {
  for (const relPath of jsonFilesForValidation) {
    const absPath = join(BLOG_ROOT, relPath);
    const raw = readFileSync(absPath, 'utf8');

    assert.doesNotThrow(
      () => JSON.parse(raw),
      `JSON parse failed for ${relPath}`,
    );
  }
});

test('tc_iE_06_all_date_fields_across_data_files_are_parseable', () => {
  const dateLikeKey = /(^|_)(date|updated|time|lastmod)(_|$)/i;

  function scan(value, keyContext, fileContext) {
    if (Array.isArray(value)) {
      for (const item of value) scan(item, keyContext, fileContext);
      return;
    }

    if (value && typeof value === 'object') {
      for (const [key, nested] of Object.entries(value)) {
        scan(nested, key, fileContext);
      }
      return;
    }

    if (typeof value === 'string' && dateLikeKey.test(keyContext)) {
      assert.ok(
        !Number.isNaN(Date.parse(value)),
        `Unparseable date value in ${fileContext} (${keyContext}): ${value}`,
      );
    }
  }

  for (const relPath of jsonFilesForValidation) {
    const parsed = JSON.parse(readFileSync(join(BLOG_ROOT, relPath), 'utf8'));
    scan(parsed, '', relPath);
  }
});

test('tc_iE_07_posts_have_no_empty_titles', () => {
  for (const post of posts) {
    assert.ok(
      typeof post.title === 'string' && post.title.trim().length > 0,
      `posts.json entry has empty title: ${post.filename}`,
    );
  }
});

test('tc_iE_08_novel_manifest_has_no_zero_episode_novels', () => {
  for (const novel of novelsManifest.novels) {
    assert.ok(
      Array.isArray(novel.episodes) && novel.episodes.length > 0,
      `Novel has zero episodes in manifest: ${novel.slug}`,
    );
  }
});
