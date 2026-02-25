import test from 'node:test';
import assert from 'node:assert/strict';
import { readJSON } from '../setup.mjs';

const posts = readJSON('posts.json');
const VALID_CATEGORIES = new Set([
  'briefing',
  'digest',
  'report',
  'journal',
  'research',
  'polish',
  'upgrade',
  'other'
]);

function filterPosts(items, category) {
  if (category === 'all') return items;
  return items.filter((post) => post.category === category);
}

test('tc_uA_01_posts_json_loads_with_array_structure', () => {
  assert.ok(Array.isArray(posts));
  assert.ok(posts.length > 0);
});

test('tc_uA_02_all_categories_are_from_valid_set', () => {
  const unique = new Set(posts.map((post) => post.category));
  for (const category of unique) {
    assert.ok(VALID_CATEGORIES.has(category), `invalid category: ${category}`);
  }
});

test('tc_uA_03_filter_briefing_returns_only_briefing_posts', () => {
  const briefing = filterPosts(posts, 'briefing');
  assert.ok(briefing.length > 0, 'briefing posts should exist');
  assert.ok(briefing.every((post) => post.category === 'briefing'));
});

test('tc_uA_04_filter_all_returns_all_posts', () => {
  const all = filterPosts(posts, 'all');
  assert.equal(all.length, posts.length);
});

test('tc_uA_05_posts_are_in_reverse_chronological_order', () => {
  for (let i = 1; i < posts.length; i += 1) {
    const prev = posts[i - 1].date;
    const curr = posts[i].date;
    assert.ok(prev >= curr, `order mismatch at index ${i - 1} (${prev} < ${curr})`);
  }
});

test('tc_uA_06_each_post_has_required_fields', () => {
  for (const post of posts) {
    assert.ok(typeof post.filename === 'string' && post.filename.length > 0);
    assert.ok(typeof post.date === 'string' && post.date.length > 0);
    assert.ok(typeof post.category === 'string' && post.category.length > 0);
    assert.ok(typeof post.title === 'string' && post.title.length > 0);
    assert.ok(typeof post.excerpt === 'string' && post.excerpt.length > 0);
  }
});

test('tc_uA_07_all_dates_match_yyyy_mm_dd_format', () => {
  const dateRe = /^\d{4}-\d{2}-\d{2}$/;
  for (const post of posts) {
    assert.match(post.date, dateRe, `invalid date: ${post.date}`);
  }
});

test('tc_uA_08_no_duplicate_filenames', () => {
  const filenames = posts.map((post) => post.filename);
  const unique = new Set(filenames);
  assert.equal(unique.size, filenames.length);
});

test('tc_uA_09_all_filenames_match_required_pattern', () => {
  const filenameRe = /^\d{4}-\d{2}-\d{2}-.+\.md$/;
  for (const post of posts) {
    assert.match(post.filename, filenameRe, `invalid filename: ${post.filename}`);
  }
});

test('tc_uA_10_excerpt_length_is_within_limit', () => {
  for (const post of posts) {
    assert.ok(post.excerpt.length <= 124, `excerpt too long (${post.excerpt.length}): ${post.filename}`);
  }
});
