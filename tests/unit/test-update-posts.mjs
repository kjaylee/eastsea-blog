import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { BLOG_ROOT, fileExists, readText } from '../setup.mjs';

let tempDir;
let generatedPosts = [];

before(() => {
  const tmpRoot = join(BLOG_ROOT, 'tests', '.tmp');
  mkdirSync(tmpRoot, { recursive: true });
  tempDir = mkdtempSync(join(tmpRoot, 'update-posts-unit-'));

  // Copy script under test
  writeFileSync(join(tempDir, 'update-posts.sh'), readText('update-posts.sh'));
  chmodSync(join(tempDir, 'update-posts.sh'), 0o755);

  // Minimal blog source
  const postsDir = join(tempDir, '_posts');
  mkdirSync(postsDir, { recursive: true });

  writeFileSync(join(postsDir, '2026-02-01-daily-briefing.md'), `---\ntitle: Daily Briefing\ndate: 2026-02-01\ncategories: [briefing]\n---\n이 문장은 30자 이상으로 작성하여 excerpt 추출 대상이 됩니다.\n`);

  writeFileSync(join(postsDir, '2026-02-02-research-note.md'), `---\ntitle: Research Note\ndate: 2026-02-02\ncategories: [research]\n---\n연구 노트 본문입니다. 충분히 긴 설명을 넣어서 요약 대상이 되게 합니다.\n`);

  writeFileSync(join(postsDir, '2026-02-03-dev-diary.md'), `---\ntitle: Dev Diary\ndate: 2026-02-03\n---\n오늘 개발 회고를 길게 남깁니다. 일지 형식이라 category 추론이 동작해야 합니다.\n`);

  // Stub git so script can run in temp directory without real git side effects
  const fakeBin = join(tempDir, 'fakebin');
  mkdirSync(fakeBin, { recursive: true });
  writeFileSync(join(fakeBin, 'git'), '#!/bin/sh\nexit 0\n');
  chmodSync(join(fakeBin, 'git'), 0o755);

  execSync(`PATH="${fakeBin}:$PATH" bash update-posts.sh`, { cwd: tempDir, stdio: 'pipe' });
  generatedPosts = JSON.parse(readFileSync(join(tempDir, 'posts.json'), 'utf8'));
});

after(() => {
  if (tempDir) rmSync(tempDir, { recursive: true, force: true });
});

test('tc_update_posts_01_script_exists_in_repo', () => {
  assert.ok(fileExists('update-posts.sh'));
});

test('tc_update_posts_02_script_generates_posts_json', () => {
  assert.ok(existsSync(join(tempDir, 'posts.json')));
  assert.ok(Array.isArray(generatedPosts));
  assert.equal(generatedPosts.length, 3);
});

test('tc_update_posts_03_generated_items_have_required_fields', () => {
  for (const post of generatedPosts) {
    assert.equal(typeof post.filename, 'string');
    assert.equal(typeof post.date, 'string');
    assert.equal(typeof post.category, 'string');
    assert.equal(typeof post.title, 'string');
    assert.equal(typeof post.excerpt, 'string');
  }
});

test('tc_update_posts_04_category_detection_works', () => {
  const byFile = new Map(generatedPosts.map((p) => [p.filename, p]));

  assert.equal(byFile.get('2026-02-01-daily-briefing.md')?.category, 'briefing');
  assert.equal(byFile.get('2026-02-02-research-note.md')?.category, 'research');
  assert.equal(byFile.get('2026-02-03-dev-diary.md')?.category, 'journal');
});

test('tc_update_posts_05_output_is_sorted_newest_first', () => {
  const filenames = generatedPosts.map((p) => p.filename);
  assert.deepEqual(filenames, [
    '2026-02-03-dev-diary.md',
    '2026-02-02-research-note.md',
    '2026-02-01-daily-briefing.md',
  ]);
});

test('tc_update_posts_06_generated_count_matches_source_posts', () => {
  const sourceCount = 3;
  assert.equal(generatedPosts.length, sourceCount);
});
