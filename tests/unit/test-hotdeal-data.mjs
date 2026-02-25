import test from 'node:test';
import assert from 'node:assert/strict';
import { readJSON } from '../setup.mjs';

const deals = readJSON('hotdeal/data/deals.json');
const free = readJSON('hotdeal/data/free.json');
const popular = readJSON('hotdeal/data/popular.json');
const meta = readJSON('hotdeal/data/meta.json');

function hasCoreFields(item) {
  return item
    && typeof item.id === 'string'
    && typeof item.title === 'string'
    && typeof item.slug === 'string'
    && typeof item.updated_at === 'string'
    && item.price
    && item.store;
}

test('tc_hotdeal_01_all_datasets_have_expected_top_level_shape', () => {
  assert.ok(Array.isArray(deals));
  assert.ok(Array.isArray(free));
  assert.ok(Array.isArray(popular));
  assert.equal(typeof meta, 'object');

  assert.ok(deals.length > 0);
  assert.ok(popular.length > 0);
});

test('tc_hotdeal_02_deals_have_required_fields', () => {
  for (const deal of deals) {
    assert.ok(hasCoreFields(deal), `Missing core fields: ${deal?.id}`);
    assert.equal(typeof deal.price.current, 'number');
    assert.equal(typeof deal.price.regular, 'number');
    assert.equal(typeof deal.price.cut, 'number');
    assert.equal(typeof deal.store.name, 'string');
    assert.equal(typeof deal.store.url, 'string');
  }
});

test('tc_hotdeal_03_price_values_are_in_valid_range', () => {
  for (const deal of deals) {
    assert.ok(deal.price.current >= 0, `current < 0: ${deal.id}`);
    assert.ok(deal.price.regular >= 0, `regular < 0: ${deal.id}`);
    assert.ok(deal.price.current <= deal.price.regular, `current > regular: ${deal.id}`);
    assert.ok(deal.price.cut >= 0 && deal.price.cut <= 100, `invalid discount cut: ${deal.id}`);
  }
});

test('tc_hotdeal_04_free_tab_contains_free_items', () => {
  for (const item of free) {
    assert.ok(hasCoreFields(item), `free item invalid: ${item?.id}`);
    assert.equal(item.price.current, 0, `free item has non-zero price: ${item.id}`);
  }
});

test('tc_hotdeal_05_popular_has_overlap_with_deals', () => {
  const dealIds = new Set(deals.map((d) => d.id));
  const overlap = popular.filter((p) => dealIds.has(p.id)).length;
  assert.ok(overlap > 0, 'popular has no overlap with deals');
  assert.ok(overlap >= Math.ceil(popular.length * 0.5), `overlap too low: ${overlap}/${popular.length}`);
});

test('tc_hotdeal_06_meta_file_counts_match_loaded_data', () => {
  assert.equal(meta.files.deals, deals.length);
  assert.equal(meta.files.free, free.length);
  assert.equal(meta.files.popular, popular.length);
  assert.ok(meta.total_deals >= deals.length);
});
