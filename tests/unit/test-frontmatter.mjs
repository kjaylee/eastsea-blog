import test from 'node:test';
import assert from 'node:assert/strict';
import { listDir, readText } from '../setup.mjs';

const postFiles = listDir('_posts').filter((name) => name.endsWith('.md'));

function splitFrontMatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;
  return { frontMatter: match[1], body: match[2] };
}

function parseFrontMatterBlock(block) {
  const out = {};
  for (const rawLine of block.split('\n')) {
    if (!rawLine || /^\s*-\s+/.test(rawLine)) continue;
    const idx = rawLine.indexOf(':');
    if (idx < 0) continue;
    const key = rawLine.slice(0, idx).trim();
    const value = rawLine.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    out[key] = value;
  }
  return out;
}

function isDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

test('tc_frontmatter_01_all_posts_have_front_matter_block', () => {
  assert.ok(postFiles.length > 0);
  for (const file of postFiles) {
    const content = readText(`_posts/${file}`);
    assert.ok(content.startsWith('---\n'), `${file} does not start with front matter delimiter`);
    assert.ok(splitFrontMatter(content), `${file} has invalid front matter structure`);
  }
});

test('tc_frontmatter_02_required_fields_title_and_date_exist', () => {
  for (const file of postFiles) {
    const content = readText(`_posts/${file}`);
    const parsed = splitFrontMatter(content);
    const fm = parseFrontMatterBlock(parsed.frontMatter);

    assert.ok(fm.title, `${file} missing title`);
    assert.ok(fm.date, `${file} missing date`);
  }
});

test('tc_frontmatter_03_date_has_valid_format', () => {
  for (const file of postFiles) {
    const { frontMatter } = splitFrontMatter(readText(`_posts/${file}`));
    const fm = parseFrontMatterBlock(frontMatter);
    const dateOnly = String(fm.date).slice(0, 10);
    assert.ok(isDate(dateOnly), `${file} has invalid date: ${fm.date}`);
  }
});

test('tc_frontmatter_04_filename_date_matches_front_matter_date', () => {
  for (const file of postFiles) {
    const fileDate = file.slice(0, 10);
    const { frontMatter } = splitFrontMatter(readText(`_posts/${file}`));
    const fm = parseFrontMatterBlock(frontMatter);
    const dateOnly = String(fm.date).slice(0, 10);
    assert.equal(dateOnly, fileDate, `${file} date mismatch`);
  }
});

test('tc_frontmatter_05_title_is_not_blank', () => {
  for (const file of postFiles) {
    const { frontMatter } = splitFrontMatter(readText(`_posts/${file}`));
    const fm = parseFrontMatterBlock(frontMatter);
    assert.ok(String(fm.title).trim().length > 0, `${file} has blank title`);
  }
});

test('tc_frontmatter_06_markdown_body_is_not_empty', () => {
  for (const file of postFiles) {
    const parsed = splitFrontMatter(readText(`_posts/${file}`));
    assert.ok(parsed.body.trim().length > 0, `${file} has empty body`);
  }
});
