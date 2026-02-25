import test from 'node:test';
import assert from 'node:assert/strict';
import {
  listDir,
  readJSON,
  readText,
  loadViewHelpers,
  loadPostsJsonGenerator
} from '../setup.mjs';

const posts = readJSON('posts.json');
const postFiles = listDir('_posts').filter((name) => name.endsWith('.md')).sort();
const samplePosts = posts.slice(0, 10);
const { parseFrontMatter } = loadViewHelpers();
const { detectCategory } = loadPostsJsonGenerator();

function readPostFile(filename) {
  return readText(`_posts/${filename}`);
}

function normalizeFrontMatterDate(value) {
  if (!value) return null;
  const match = String(value).match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : null;
}

test('tc_uB_01_each_post_file_in_posts_directory_is_readable', () => {
  assert.ok(postFiles.length > 0);
  for (const filename of postFiles) {
    const content = readPostFile(filename);
    assert.ok(typeof content === 'string' && content.length > 0, `unreadable: ${filename}`);
  }
});

test('tc_uB_02_sample_10_posts_have_parseable_front_matter', () => {
  assert.equal(samplePosts.length, 10);
  for (const post of samplePosts) {
    const markdown = readPostFile(post.filename);
    const parsed = parseFrontMatter(markdown);
    assert.ok(parsed && typeof parsed === 'object');
    assert.ok(parsed.frontMatter && typeof parsed.frontMatter === 'object');
    assert.ok(Object.keys(parsed.frontMatter).length > 0, `empty front matter: ${post.filename}`);
  }
});

test('tc_uB_03_sample_front_matter_dates_match_posts_json_dates', () => {
  for (const post of samplePosts) {
    const markdown = readPostFile(post.filename);
    const parsed = parseFrontMatter(markdown);
    const fmDate = normalizeFrontMatterDate(parsed.frontMatter.date);
    assert.equal(fmDate, post.date, `date mismatch: ${post.filename}`);
  }
});

test('tc_uB_04_category_detection_is_consistent_with_posts_json', () => {
  for (const post of posts) {
    const markdown = readPostFile(post.filename);
    const parsed = parseFrontMatter(markdown);
    const categories = Array.isArray(parsed.frontMatter.categories)
      ? parsed.frontMatter.categories.join(',')
      : parsed.frontMatter.categories;

    const byFrontMatter = detectCategory(post.filename, categories);
    const byFilename = detectCategory(post.filename, undefined);

    assert.ok(
      post.category === byFrontMatter || post.category === byFilename,
      `category mismatch: ${post.filename} (fm=${byFrontMatter}, filename=${byFilename}, posts.json=${post.category})`
    );
  }
});

test('tc_uB_05_no_unclosed_triple_backtick_code_blocks', () => {
  for (const post of posts) {
    const markdown = readPostFile(post.filename);
    const fenceCount = (markdown.match(/```/g) || []).length;
    assert.equal(fenceCount % 2, 0, `unbalanced code fences: ${post.filename}`);
  }
});

test('tc_uB_06_post_body_content_is_non_empty', () => {
  for (const post of posts) {
    const markdown = readPostFile(post.filename);
    const parsed = parseFrontMatter(markdown);
    assert.ok(parsed.content.trim().length > 0, `empty body: ${post.filename}`);
  }
});

test('tc_uB_07_view_url_parameter_format_is_valid', () => {
  const urlRe = /^view\.html\?post=[^&]+\.md$/;
  for (const post of posts) {
    const url = `view.html?post=${post.filename}`;
    assert.match(url, urlRe);
  }
});

test('tc_uB_08_sidebar_filter_simulation_returns_same_category_posts', () => {
  const target = posts[0];
  const sidebar = posts
    .filter((post) => post.category === target.category)
    .sort((a, b) => b.date.localeCompare(a.date));

  assert.ok(sidebar.length > 0);
  assert.ok(sidebar.every((post) => post.category === target.category));
  assert.ok(sidebar.some((post) => post.filename === target.filename));
});

test('tc_uB_09_sample_posts_have_heading_or_meaningful_paragraph', () => {
  for (const post of samplePosts) {
    const markdown = readPostFile(post.filename);
    const parsed = parseFrontMatter(markdown);
    const lines = parsed.content
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const hasHeading = lines.some((line) => line.startsWith('#'));
    const hasParagraph = lines.some((line) => !line.startsWith('#') && line.length >= 20);
    assert.ok(hasHeading || hasParagraph, `no meaningful content blocks: ${post.filename}`);
  }
});

test('tc_uB_10_post_query_parameter_roundtrip_preserves_filename', () => {
  for (const post of samplePosts) {
    const url = new URL(`https://eastsea.monster/view.html?post=${encodeURIComponent(post.filename)}`);
    const received = url.searchParams.get('post');
    assert.equal(received, post.filename);
    assert.match(received, /\.md$/);
  }
});
