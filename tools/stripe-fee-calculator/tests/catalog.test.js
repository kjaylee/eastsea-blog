const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const toolDir = path.resolve(__dirname, '..');
const repoRoot = path.resolve(toolDir, '..', '..');
const slug = 'stripe-fee-calculator';
const url = `/tools/${slug}/`;

test('catalog integration exists exactly once across discovery surfaces', () => {
  const htmlIndex = fs.readFileSync(path.join(repoRoot, 'tools', 'index.html'), 'utf8');
  const markdownIndex = fs.readFileSync(path.join(repoRoot, 'tools', 'index.md'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tools', 'manifest.json'), 'utf8'));
  const toolsList = JSON.parse(fs.readFileSync(path.join(repoRoot, '_data', 'tools-list.json'), 'utf8'));

  const htmlMatches = (htmlIndex.match(new RegExp(`href="${slug}/"`, 'g')) || []).length;
  const mdMatches = (markdownIndex.match(new RegExp(`\(\./${slug}/\)`, 'g')) || []).length;
  const manifestMatches = manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length;
  const listMatches = toolsList.filter((entry) => entry.url === url).length;

  assert.equal(htmlMatches, 1, 'tools/index.html should link to the tool exactly once');
  assert.equal(mdMatches, 1, 'tools/index.md should reference the tool exactly once');
  assert.equal(manifestMatches, 1, 'tools/manifest.json should include the tool exactly once');
  assert.equal(listMatches, 1, '_data/tools-list.json should include the tool exactly once');
});
