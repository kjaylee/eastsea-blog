import test from 'node:test';
import assert from 'node:assert/strict';
import { readText } from '../setup.mjs';

const indexHtml = readText('index.html');
const deployScript = readText('scripts/cf-pages-auto-deploy.sh');

test('homepage has no hard post-count cap', () => {
  assert.doesNotMatch(indexHtml, /MAX_POSTS/);
});

test('homepage stops from the D1 declared total', () => {
  assert.match(indexHtml, /totalAvailable/);
  assert.match(indexHtml, /totalLoaded\s*>=\s*totalAvailable/);
});

test('homepage sends category filtering to D1', () => {
  assert.match(indexHtml, /params\.set\(['"]category['"],\s*normalizedFilter\)/);
});

test('Cloudflare Pages staging generates D1 projections', () => {
  assert.match(deployScript, /generate-d1-projections\.py/);
  assert.match(deployScript, /--output-dir\s+["']?\$stage_dir/);
});

