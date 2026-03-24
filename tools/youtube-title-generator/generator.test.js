const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { smartCase, normalizeOptions, scoreTitle, generateTitleIdeas } = require('./generator.js');

test('smartCase preserves brand casing', () => {
  assert.equal(smartCase('youtube seo for ai'), 'YouTube SEO For AI');
});

test('normalizeOptions clamps requested count', () => {
  const low = normalizeOptions({ count: 1 });
  const high = normalizeOptions({ count: 99 });
  assert.equal(low.count, 6);
  assert.equal(high.count, 24);
});

test('generateTitleIdeas returns requested count and unique titles', () => {
  const rows = generateTitleIdeas({
    topic: 'budget travel',
    primaryKeyword: 'budget travel',
    audience: 'creators',
    outcome: 'more clicks',
    tone: 'curiosity',
    format: 'tutorial',
    count: 12,
  });

  assert.equal(rows.length, 12);
  assert.equal(new Set(rows.map((row) => row.title)).size, 12);
  assert.ok(rows.every((row) => /budget travel/i.test(row.title)));
  assert.ok(rows.some((row) => row.keywordFirst));
});

test('generateTitleIdeas remains deterministic for identical input', () => {
  const input = {
    topic: 'iphone filmmaking',
    primaryKeyword: 'iphone filmmaking',
    audience: 'beginners',
    outcome: 'better watch time',
    tone: 'clear',
    format: 'review',
    count: 8,
  };
  const first = generateTitleIdeas(input).map((row) => row.title);
  const second = generateTitleIdeas(input).map((row) => row.title);
  assert.deepEqual(first, second);
});

test('scoreTitle rewards solid title ranges', () => {
  const strong = scoreTitle('How to Get More Clicks with Budget Travel Titles');
  const weak = scoreTitle('Budget travel');
  assert.ok(strong.score > weak.score);
  assert.equal(strong.verdict, 'strong');
});

test('HTML contains exact-match copy and analytics include', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  assert.match(html, /YouTube Title Generator/);
  assert.match(html, /Generate click-ready YouTube titles/i);
  assert.match(html, /Copy all/i);
  assert.match(html, /\/assets\/analytics\.js/);
});

test('discovery integration exists exactly once for youtube-title-generator', () => {
  const toolDir = __dirname;
  const repoRoot = path.resolve(toolDir, '..', '..');
  const targetSlug = 'youtube-title-generator';
  const htmlIndex = fs.readFileSync(path.join(repoRoot, 'tools', 'index.html'), 'utf8');
  const markdownIndex = fs.readFileSync(path.join(repoRoot, 'tools', 'index.md'), 'utf8');
  const toolsList = fs.readFileSync(path.join(repoRoot, '_data', 'tools-list.json'), 'utf8');

  assert.equal((htmlIndex.match(/href="youtube-title-generator\//g) || []).length, 1, 'index.html should link to the YouTube title generator exactly once');
  assert.equal((markdownIndex.match(/\.\/youtube-title-generator\//g) || []).length, 1, 'index.md should link to the YouTube title generator exactly once');
  assert.equal((toolsList.match(/\/tools\/youtube-title-generator\//g) || []).length, 1, '_data/tools-list.json should contain the YouTube title generator URL exactly once');

  const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tools', 'manifest.json'), 'utf8'));
  const matches = manifest.tools.filter((entry) => entry.slug === targetSlug);
  assert.equal(matches.length, 1, 'manifest.json should contain exactly one youtube-title-generator entry');
  assert.equal(matches[0].url, '/tools/youtube-title-generator/');
});

test('manifest size matches on-disk folder size', () => {
  const repoRoot = path.resolve(__dirname, '..', '..');
  const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tools', 'manifest.json'), 'utf8'));
  const entry = manifest.tools.find((item) => item.slug === 'youtube-title-generator');
  assert.ok(entry, 'manifest entry missing for youtube-title-generator');

  const toolRoot = path.join(repoRoot, 'tools', 'youtube-title-generator');
  const files = fs.readdirSync(toolRoot);
  const actualSize = files.reduce((sum, file) => sum + fs.statSync(path.join(toolRoot, file)).size, 0);

  assert.equal(entry.size, actualSize, 'manifest size should match the current tool folder size');
});
