'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  LIMITS,
  SAMPLE_INPUT,
  measurePixelWidth,
  classifyWidth,
  trimToFit,
  analyzeSnippet,
  buildAuditSummary,
} = require('./calculator.js');

const toolDir = __dirname;
const repoRoot = path.resolve(toolDir, '..', '..');
const slug = 'google-title-meta-pixel-checker';
const url = `/tools/${slug}/`;
const html = fs.readFileSync(path.join(toolDir, 'index.html'), 'utf8');

test('TC-GTMP-01 wide characters measure wider than narrow characters', () => {
  const wide = measurePixelWidth('WWWWWW', 'titleDesktop');
  const narrow = measurePixelWidth('iiiiii', 'titleDesktop');
  assert.ok(wide > narrow, `${wide} should be > ${narrow}`);
});

test('TC-GTMP-02 sample title fits desktop and mobile budgets', () => {
  const result = analyzeSnippet(SAMPLE_INPUT);
  assert.equal(result.title.desktop.status, 'safe');
  assert.equal(result.title.mobile.status, 'safe');
  assert.ok(result.title.desktop.pixelWidth < LIMITS.titleDesktop.maxPx);
  assert.ok(result.title.mobile.pixelWidth < LIMITS.titleMobile.maxPx);
});

test('TC-GTMP-03 long title is over budget and trimmed with ellipsis', () => {
  const longTitle = 'W'.repeat(70);
  const result = analyzeSnippet({ title: longTitle, description: 'Short description', urlPath: 'blog/example' });
  assert.equal(result.title.desktop.status, 'over');
  assert.match(result.title.desktop.trimSuggestion, /…$/);
  assert.ok(measurePixelWidth(result.title.desktop.trimSuggestion, 'titleDesktop') <= LIMITS.titleDesktop.maxPx);
});

test('TC-GTMP-04 long description exceeds mobile budget and suggested trim fits', () => {
  const longDescription = 'Meta descriptions should stay readable in search results even when marketers keep stacking modifier phrases, locations, benefits, and proof points into the same snippet line.';
  const result = analyzeSnippet({ title: 'SEO title', description: longDescription, urlPath: 'seo/checker' });
  assert.equal(result.description.mobile.status, 'over');
  assert.match(result.description.mobile.trimSuggestion, /…$/);
  assert.ok(measurePixelWidth(result.description.mobile.trimSuggestion, 'descriptionMobile') <= LIMITS.descriptionMobile.maxPx);
});

test('TC-GTMP-05 audit summary includes status lines and caveat', () => {
  const summary = buildAuditSummary(analyzeSnippet(SAMPLE_INPUT));
  assert.match(summary, /Title desktop:/);
  assert.match(summary, /Description mobile:/);
  assert.match(summary, /Caveat: Pixel widths are estimated/);
});

test('TC-GTMP-06 classification boundaries are deterministic', () => {
  assert.equal(classifyWidth(100, 200), 'safe');
  assert.equal(classifyWidth(180, 200), 'tight');
  assert.equal(classifyWidth(201, 200), 'over');
});

test('TC-GTMP-07 HTML contains required metadata, controls, previews, and related links', () => {
  for (const token of [
    '<title>Google Title &amp; Meta Pixel Width Checker</title>',
    'id="titleInput"',
    'id="descriptionInput"',
    'id="urlPathInput"',
    'id="desktopTitle"',
    'id="mobileTitle"',
    'SERP truncation checker',
    'Pixel widths are <strong>estimates</strong>',
    '/assets/analytics.js',
    './calculator.js',
    '/tools/seo-meta-checker/',
    '/tools/social-share-preview/',
    '/tools/blog-post-optimizer/'
  ]) {
    assert.ok(html.includes(token), token);
  }
});

test('TC-GTMP-08 discovery wiring is exact-once across catalog surfaces', () => {
  const toolsIndexHtml = fs.readFileSync(path.join(repoRoot, 'tools', 'index.html'), 'utf8');
  const toolsIndexMd = fs.readFileSync(path.join(repoRoot, 'tools', 'index.md'), 'utf8');
  const toolsList = JSON.parse(fs.readFileSync(path.join(repoRoot, '_data', 'tools-list.json'), 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tools', 'manifest.json'), 'utf8'));

  const htmlMatches = (toolsIndexHtml.match(new RegExp(`href="${slug}/"`, 'g')) || []).length;
  const mdMatches = (toolsIndexMd.match(new RegExp(`\(\./${slug}/\)`, 'g')) || []).length;
  const listMatches = toolsList.filter((entry) => entry.url === url).length;
  const manifestMatches = manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length;

  assert.equal(htmlMatches, 1, 'tools/index.html exact-once');
  assert.equal(mdMatches, 1, 'tools/index.md exact-once');
  assert.equal(listMatches, 1, '_data/tools-list.json exact-once');
  assert.equal(manifestMatches, 1, 'tools/manifest.json exact-once');
});

test('TC-GTMP-09 catalog metadata matches intent', () => {
  const toolsList = JSON.parse(fs.readFileSync(path.join(repoRoot, '_data', 'tools-list.json'), 'utf8'));
  const entry = toolsList.find((item) => item.url === url);
  assert.ok(entry, 'tools-list entry must exist');
  assert.match(entry.title, /Google Title/i);
  assert.match(entry.description, /pixel width/i);
});

test('TC-GTMP-10 trimToFit leaves already-safe text unchanged', () => {
  const text = 'Short SEO title';
  assert.equal(trimToFit(text, 'titleDesktop', LIMITS.titleDesktop.maxPx), text);
});
