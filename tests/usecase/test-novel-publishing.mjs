import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { BLOG_ROOT, readText } from '../setup.mjs';

let tempDir;

function runUpdateNovels() {
  execSync('AUTO_COMMIT=false MINIPC_HOST=127.0.0.1 MINIPC_USER=nouser bash scripts/update-novels.sh', {
    cwd: tempDir,
    stdio: 'pipe'
  });
  return JSON.parse(readFileSync(join(tempDir, 'novels', 'manifest.json'), 'utf8'));
}

before(() => {
  const tmpRoot = join(BLOG_ROOT, 'tests', '.tmp');
  mkdirSync(tmpRoot, { recursive: true });
  tempDir = mkdtempSync(join(tmpRoot, 'usecase-novel-publish-'));

  mkdirSync(join(tempDir, 'scripts'), { recursive: true });
  mkdirSync(join(tempDir, 'novels', '_data'), { recursive: true });

  writeFileSync(join(tempDir, 'scripts', 'update-novels.sh'), readText('scripts/update-novels.sh'));
  chmodSync(join(tempDir, 'scripts', 'update-novels.sh'), 0o755);

  writeFileSync(join(tempDir, 'novels', '_data', 'sample-series-001.md'), `---\nseries: 샘플 시리즈\nslug: sample-series\nepisode: 1\ntitle: 시작\ndate: 2026-02-01\nauthor: 테스트 작가\ngenre: [판타지, 모험]\n---\n첫 번째 화 본문\n`);
});

after(() => {
  if (tempDir) rmSync(tempDir, { recursive: true, force: true });
});

test('tc_novel_publish_01_first_episode_creates_manifest_entry', () => {
  const manifest = runUpdateNovels();
  assert.ok(Array.isArray(manifest.novels));
  assert.equal(manifest.novels.length, 1);

  const novel = manifest.novels[0];
  assert.equal(novel.slug, 'sample-series');
  assert.equal(novel.totalEpisodes, 1);
  assert.equal(novel.episodes[0].num, '001');
});

test('tc_novel_publish_02_adding_episode_updates_total_and_index', () => {
  writeFileSync(join(tempDir, 'novels', '_data', 'sample-series-002.md'), `---\nseries: 샘플 시리즈\nslug: sample-series\nepisode: 2\ntitle: 확장\ndate: 2026-02-02\nauthor: 테스트 작가\ngenre: [판타지, 모험]\n---\n두 번째 화 본문\n`);

  const manifest = runUpdateNovels();
  const novel = manifest.novels.find((n) => n.slug === 'sample-series');

  assert.equal(novel.totalEpisodes, 2);
  assert.deepEqual(novel.episodes.map((ep) => ep.num), ['001', '002']);
});

test('tc_novel_publish_03_latest_date_reflects_new_episode', () => {
  const manifest = runUpdateNovels();
  const novel = manifest.novels.find((n) => n.slug === 'sample-series');
  assert.equal(novel.latestDate, '2026-02-02');
});

test('tc_novel_publish_04_generated_pages_include_series_slug', () => {
  runUpdateNovels();
  const indexHtml = readFileSync(join(tempDir, 'novels', 'index.html'), 'utf8');
  const seriesHtml = readFileSync(join(tempDir, 'novels', 'series.html'), 'utf8');

  assert.match(indexHtml, /series\.html\?series=sample-series/);
  assert.match(seriesHtml, /'sample-series':\s*\{/);
});
