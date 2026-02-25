import test from 'node:test';
import assert from 'node:assert/strict';
import { fileExists, readJSON } from '../setup.mjs';

const DATA_DIR = 'hotdeal/data';
const TAB_FILES = ['popular', 'free', 'lowest', 'korean', 'top_rated', 'deals'];

const meta = readJSON(`${DATA_DIR}/meta.json`);
const tabData = Object.fromEntries(
  TAB_FILES.map((name) => [name, readJSON(`${DATA_DIR}/${name}.json`)])
);

function getDealUrl(deal) {
  return deal?.store?.url || deal?.url || '';
}

test('tc_uC_01_meta_json_exists_and_loads', () => {
  assert.ok(fileExists(`${DATA_DIR}/meta.json`));
  assert.ok(meta && typeof meta === 'object');
});

test('tc_uC_02_meta_json_has_required_structure', () => {
  assert.ok(typeof meta.updated_at === 'string');
  assert.ok(meta.sources && typeof meta.sources === 'object');
  assert.ok(typeof meta.total_deals === 'number');
  assert.ok(meta.files && typeof meta.files === 'object');
});

test('tc_uC_03_meta_updated_at_is_iso_datetime', () => {
  const isoLike = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?([+-]\d{2}:\d{2}|Z)$/;
  assert.match(meta.updated_at, isoLike);
});

test('tc_uC_04_all_expected_tab_data_files_exist', () => {
  for (const tab of TAB_FILES) {
    assert.ok(fileExists(`${DATA_DIR}/${tab}.json`), `missing: ${tab}.json`);
  }
});

test('tc_uC_05_each_tab_file_is_valid_non_empty_json_array', () => {
  for (const tab of TAB_FILES) {
    const arr = tabData[tab];
    assert.ok(Array.isArray(arr), `${tab}.json must be an array`);
    assert.ok(arr.length > 0, `${tab}.json must not be empty`);
  }
});

test('tc_uC_06_popular_deals_have_required_fields', () => {
  for (const deal of tabData.popular) {
    assert.ok(typeof deal.title === 'string' && deal.title.length > 0);
    assert.ok(deal.price && Object.hasOwn(deal.price, 'current'));
    assert.ok(deal.store && typeof deal.store.name === 'string' && deal.store.name.length > 0);
  }
});

test('tc_uC_07_free_tab_deals_have_free_pricing', () => {
  for (const deal of tabData.free) {
    const current = deal?.price?.current;
    const asString = String(current).toLowerCase();
    const isFree = current === 0 || current === '0' || asString === 'free';
    assert.ok(isFree, `not free pricing: ${deal.title}`);
  }
});

test('tc_uC_08_all_deal_urls_use_https', () => {
  for (const tab of TAB_FILES) {
    for (const deal of tabData[tab]) {
      const url = getDealUrl(deal);
      if (!url) continue;
      assert.match(url, /^https:\/\//, `non-https url in ${tab}: ${url}`);
    }
  }
});

test('tc_uC_09_korean_tab_contains_korean_language_indicator', () => {
  for (const deal of tabData.korean) {
    const langs = deal?.steam_meta?.languages || deal?.meta?.languages || [];
    const hasKoreanLanguage = Array.isArray(langs) && langs.some((lang) => String(lang).includes('한국'));
    const hasFlag = deal?.steam_meta?.has_korean === 1 || deal?.meta?.has_korean === 1;
    assert.ok(hasKoreanLanguage || hasFlag, `missing korean indicator: ${deal.title}`);
  }
});

test('tc_uC_10_price_history_items_have_date_and_price', () => {
  for (const deal of tabData.popular) {
    assert.ok(Array.isArray(deal.price_history), `price_history missing: ${deal.title}`);
    assert.ok(deal.price_history.length > 0, `empty price_history: ${deal.title}`);

    for (const point of deal.price_history.slice(0, 10)) {
      assert.ok(typeof point.date === 'string' && point.date.length > 0);
      assert.ok(typeof point.price === 'number' || typeof point.price === 'string');
    }
  }
});
