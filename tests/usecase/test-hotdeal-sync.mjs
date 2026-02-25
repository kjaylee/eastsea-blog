import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { BLOG_ROOT } from '../setup.mjs';

let tempDir;
let dataDir;

function readJson(name) {
  return JSON.parse(readFileSync(join(dataDir, `${name}.json`), 'utf8'));
}

function writeJson(name, value) {
  writeFileSync(join(dataDir, `${name}.json`), JSON.stringify(value, null, 2));
}

function validateHotdealSet() {
  const deals = readJson('deals');
  const free = readJson('free');
  const popular = readJson('popular');
  const meta = readJson('meta');

  if (!Array.isArray(deals) || !Array.isArray(free) || !Array.isArray(popular)) {
    throw new Error('dataset arrays are invalid');
  }

  if (meta.files.deals !== deals.length) throw new Error('meta.files.deals mismatch');
  if (meta.files.free !== free.length) throw new Error('meta.files.free mismatch');
  if (meta.files.popular !== popular.length) throw new Error('meta.files.popular mismatch');

  const dealIds = new Set(deals.map((d) => d.id));
  for (const item of free) {
    if (item.price?.current !== 0) throw new Error(`free item not free: ${item.id}`);
    if (!item.id || !item.slug || !item.title) throw new Error(`free item missing core fields: ${item.id}`);
  }

  const popularInDeals = popular.filter((p) => dealIds.has(p.id)).length;
  if (popularInDeals === 0) throw new Error('popular has no overlap with deals');

  return { deals, free, popular, meta };
}

before(() => {
  const tmpRoot = join(BLOG_ROOT, 'tests', '.tmp');
  mkdirSync(tmpRoot, { recursive: true });
  tempDir = mkdtempSync(join(tmpRoot, 'usecase-hotdeal-sync-'));
  dataDir = join(tempDir, 'hotdeal', 'data');
  mkdirSync(dataDir, { recursive: true });

  for (const name of ['deals', 'free', 'popular', 'meta']) {
    const src = readFileSync(join(BLOG_ROOT, 'hotdeal', 'data', `${name}.json`), 'utf8');
    writeFileSync(join(dataDir, `${name}.json`), src);
  }
});

after(() => {
  if (tempDir) rmSync(tempDir, { recursive: true, force: true });
});

test('tc_hotdeal_sync_01_baseline_dataset_is_consistent', () => {
  assert.doesNotThrow(() => validateHotdealSet());
});

test('tc_hotdeal_sync_02_appending_new_free_deal_keeps_integrity', () => {
  const deals = readJson('deals');
  const free = readJson('free');
  const popular = readJson('popular');
  const meta = readJson('meta');

  const seed = deals[0];
  const newDeal = {
    ...seed,
    id: 'integration-hotdeal-new-001',
    slug: 'integration-hotdeal-new-001',
    title: 'Integration Added Free Deal',
    price: { ...seed.price, current: 0 },
  };

  deals.push(newDeal);
  free.push(newDeal);
  popular.unshift(newDeal);

  meta.files.deals = deals.length;
  meta.files.free = free.length;
  meta.files.popular = popular.length;
  meta.total_deals = Math.max(meta.total_deals, deals.length);

  writeJson('deals', deals);
  writeJson('free', free);
  writeJson('popular', popular);
  writeJson('meta', meta);

  const out = validateHotdealSet();
  assert.ok(out.deals.some((d) => d.id === 'integration-hotdeal-new-001'));
});

test('tc_hotdeal_sync_03_incorrect_meta_update_is_detected', () => {
  const deals = readJson('deals');
  const meta = readJson('meta');

  deals.pop();
  writeJson('deals', deals);
  writeJson('meta', meta); // intentionally stale

  assert.throws(() => validateHotdealSet(), /meta\.files\.deals mismatch/);
});
