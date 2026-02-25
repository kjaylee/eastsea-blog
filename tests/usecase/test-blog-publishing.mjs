import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { BLOG_ROOT, readText } from '../setup.mjs';

let tempDir;
let fakeBin;

function runUpdatePosts() {
  execSync(`PATH="${fakeBin}:$PATH" bash update-posts.sh`, { cwd: tempDir, stdio: 'pipe' });
  return JSON.parse(readFileSync(join(tempDir, 'posts.json'), 'utf8'));
}

before(() => {
  const tmpRoot = join(BLOG_ROOT, 'tests', '.tmp');
  mkdirSync(tmpRoot, { recursive: true });
  tempDir = mkdtempSync(join(tmpRoot, 'usecase-blog-publish-'));

  writeFileSync(join(tempDir, 'update-posts.sh'), readText('update-posts.sh'));
  chmodSync(join(tempDir, 'update-posts.sh'), 0o755);

  mkdirSync(join(tempDir, '_posts'), { recursive: true });
  writeFileSync(join(tempDir, '_posts', '2026-02-01-hello-world.md'), `---\ntitle: Hello World\ndate: 2026-02-01\ncategories: [briefing]\n---\n첫 포스트 본문입니다. 30자 이상 문장으로 구성합니다.\n`);

  fakeBin = join(tempDir, 'fakebin');
  mkdirSync(fakeBin, { recursive: true });
  writeFileSync(join(fakeBin, 'git'), '#!/bin/sh\nexit 0\n');
  chmodSync(join(fakeBin, 'git'), 0o755);
});

after(() => {
  if (tempDir) rmSync(tempDir, { recursive: true, force: true });
});

test('tc_blog_publish_01_first_post_is_published_to_posts_json', () => {
  const posts = runUpdatePosts();
  assert.equal(posts.length, 1);
  assert.equal(posts[0].filename, '2026-02-01-hello-world.md');
  assert.equal(posts[0].category, 'briefing');
});

test('tc_blog_publish_02_adding_new_post_updates_posts_json', () => {
  writeFileSync(join(tempDir, '_posts', '2026-02-02-research-insight.md'), `---\ntitle: Research Insight\ndate: 2026-02-02\ncategories: [research]\n---\n두 번째 포스트는 리서치 카테고리로 발행되는 시나리오입니다.\n`);

  const posts = runUpdatePosts();
  assert.equal(posts.length, 2);
  assert.ok(posts.some((p) => p.filename === '2026-02-02-research-insight.md'));
});

test('tc_blog_publish_03_newest_post_is_sorted_first', () => {
  const posts = runUpdatePosts();
  assert.equal(posts[0].filename, '2026-02-02-research-insight.md');
  assert.equal(posts[1].filename, '2026-02-01-hello-world.md');
});

test('tc_blog_publish_04_filename_based_category_fallback_works', () => {
  writeFileSync(join(tempDir, '_posts', '2026-02-03-dev-diary.md'), `---\ntitle: Dev Diary\ndate: 2026-02-03\n---\n카테고리 없이 파일명 기반 분류를 확인합니다.\n`);

  const posts = runUpdatePosts();
  const diary = posts.find((p) => p.filename === '2026-02-03-dev-diary.md');
  assert.equal(diary?.category, 'journal');
});
