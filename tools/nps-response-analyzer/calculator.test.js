const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..', '..');
const {
  parseResponses,
  analyze
} = require('./calculator.js');

test('parses valid mixed responses and computes NPS correctly', () => {
  const { result, error } = analyze('10, 9, 8, 7, 6, 5, 0');

  assert.equal(error, '');
  assert.equal(result.validCount, 7);
  assert.equal(result.promoters, 2);
  assert.equal(result.passives, 2);
  assert.equal(result.detractors, 3);
  assert.equal(result.npsScore, -14);
  assert.equal(result.averageScore, 6.43);
});

test('returns 100 NPS for promoter-only set', () => {
  const { result, error } = analyze('9 9 10 10');

  assert.equal(error, '');
  assert.equal(result.npsScore, 100);
  assert.equal(result.promoters, 4);
  assert.equal(result.detractors, 0);
  assert.equal(result.promoterPercent, 100);
});

test('returns -100 NPS for detractor-only set', () => {
  const { result, error } = analyze('0,1,2,3,4,5,6');

  assert.equal(error, '');
  assert.equal(result.npsScore, -100);
  assert.equal(result.promoters, 0);
  assert.equal(result.detractorPercent, 100);
});

test('flags invalid tokens but still computes from valid responses', () => {
  const parsed = parseResponses('10, 9, foo, 11, -1, 6');
  assert.deepEqual(parsed.scores, [10, 9, 6]);
  assert.deepEqual(parsed.invalidTokens, ['foo', '11', '-1']);

  const { result, error } = analyze('10, 9, foo, 11, -1, 6');
  assert.equal(error, '');
  assert.equal(result.validCount, 3);
  assert.equal(result.invalidCount, 3);
  assert.equal(result.npsScore, 33);
});

test('rejects empty input', () => {
  const { result, error } = analyze('   ');
  assert.equal(result, null);
  assert.match(error, /응답 점수를 입력하세요/);
});

test('builds histogram counts for all scores', () => {
  const { result, error } = analyze('10,10,8,8,8,0');

  assert.equal(error, '');
  assert.equal(result.histogram[10], 2);
  assert.equal(result.histogram[8], 3);
  assert.equal(result.histogram[0], 1);
  assert.equal(result.histogram[9], 0);
  assert.equal(result.histogram[7], 0);
});

test('tools index contains exactly one nps-response-analyzer card', () => {
  const html = fs.readFileSync(path.join(repoRoot, 'tools', 'index.html'), 'utf8');
  const matches = html.match(/nps-response-analyzer\//g) || [];

  assert.equal(matches.length, 1, 'tools/index.html should contain exactly one tool-card link for nps-response-analyzer/');
  assert.match(html, /NPS Response Analyzer|NPS 응답 분석기/);
});

test('manifest contains exactly one nps-response-analyzer entry', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tools', 'manifest.json'), 'utf8'));
  const matches = manifest.tools.filter((tool) => tool.slug === 'nps-response-analyzer');

  assert.equal(matches.length, 1, 'tools/manifest.json should contain exactly one nps-response-analyzer entry');
  assert.equal(matches[0].url, '/tools/nps-response-analyzer/');
});
