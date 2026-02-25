import test from 'node:test';
import assert from 'node:assert/strict';
import { readText } from '../setup.mjs';

const pages = {
  index: readText('index.html'),
  about: readText('about.html'),
  hotdeal: readText('hotdeal/index.html'),
  tools: readText('tools/index.html'),
};

function getMetaDescription(html) {
  const m = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  return m?.[1] || '';
}

test('tc_seo_01_key_pages_have_non_empty_title_and_description', () => {
  for (const [name, html] of Object.entries(pages)) {
    const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '';
    const desc = getMetaDescription(html).trim();

    assert.ok(title.length > 0, `${name} missing title`);
    assert.ok(desc.length > 0, `${name} missing meta description`);
  }
});

test('tc_seo_02_key_pages_have_https_canonical_url', () => {
  for (const [name, html] of Object.entries(pages)) {
    const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1] || '';
    assert.ok(canonical.startsWith('https://'), `${name} canonical is not https: ${canonical}`);
  }
});

test('tc_seo_03_open_graph_core_tags_exist_on_landing_pages', () => {
  for (const [name, html] of Object.entries({ index: pages.index, hotdeal: pages.hotdeal, tools: pages.tools })) {
    assert.match(html, /<meta\s+property=["']og:title["']/i, `${name} missing og:title`);
    assert.match(html, /<meta\s+property=["']og:description["']/i, `${name} missing og:description`);
    assert.match(html, /<meta\s+property=["']og:url["']/i, `${name} missing og:url`);
  }
});

test('tc_seo_04_twitter_card_tags_exist_on_landing_pages', () => {
  for (const [name, html] of Object.entries({ index: pages.index, hotdeal: pages.hotdeal, tools: pages.tools })) {
    assert.match(html, /<meta\s+name=["']twitter:card["']/i, `${name} missing twitter:card`);
    assert.match(html, /<meta\s+name=["']twitter:title["']/i, `${name} missing twitter:title`);
    assert.match(html, /<meta\s+name=["']twitter:description["']/i, `${name} missing twitter:description`);
  }
});

test('tc_seo_05_index_page_contains_schema_org_structured_data', () => {
  assert.match(pages.index, /<script\s+type=["']application\/ld\+json["']/i);
  assert.match(pages.index, /https:\/\/schema\.org/i);
});
