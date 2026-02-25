import test from 'node:test';
import assert from 'node:assert/strict';
import { fileExists, listDir, readJSON } from '../setup.mjs';

const posts = readJSON('posts.json');
const postFiles = listDir('_posts').filter((name) => name.endsWith('.md'));

function isValidDateString(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

test('tc_posts_json_01_is_non_empty_array', () => {
  assert.ok(Array.isArray(posts));
  assert.ok(posts.length > 0);
});

test('tc_posts_json_02_has_required_fields', () => {
  for (const post of posts) {
    assert.equal(typeof post.filename, 'string');
    assert.equal(typeof post.date, 'string');
    assert.equal(typeof post.category, 'string');
    assert.equal(typeof post.title, 'string');
    assert.equal(typeof post.excerpt, 'string');

    assert.ok(post.filename.length > 0);
    assert.ok(post.title.trim().length > 0);
  }
});

test('tc_posts_json_03_dates_are_valid_iso_yyyy_mm_dd', () => {
  for (const post of posts) {
    assert.ok(isValidDateString(post.date), `Invalid date: ${post.date} (${post.filename})`);
  }
});

test('tc_posts_json_04_markdown_filenames_exist', () => {
  for (const post of posts) {
    assert.match(post.filename, /^\d{4}-\d{2}-\d{2}-.+\.md$/);
    assert.ok(fileExists(`_posts/${post.filename}`), `Missing markdown file: ${post.filename}`);
  }
});

test('tc_posts_json_05_slug_is_unique', () => {
  const seen = new Set();
  for (const post of posts) {
    const slug = post.filename.replace(/\.md$/, '');
    assert.ok(!seen.has(slug), `Duplicate slug detected: ${slug}`);
    seen.add(slug);
  }
});

test('tc_posts_json_06_count_matches_posts_directory', () => {
  assert.equal(posts.length, postFiles.length);
});
