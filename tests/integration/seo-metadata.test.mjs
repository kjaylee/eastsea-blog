import test from 'node:test';
import assert from 'node:assert/strict';
import { readText, fileExists } from '../setup.mjs';

const indexHtml = readText('index.html');

test('tc_iC_01_index_has_og_title_meta', () => {
  assert.match(
    indexHtml,
    /<meta\b[^>]*property=["']og:title["'][^>]*content=["'][^"']+["'][^>]*>/i,
    'index.html is missing og:title meta tag',
  );
});

test('tc_iC_02_index_has_og_description_meta', () => {
  assert.match(
    indexHtml,
    /<meta\b[^>]*property=["']og:description["'][^>]*content=["'][^"']+["'][^>]*>/i,
    'index.html is missing og:description meta tag',
  );
});

test('tc_iC_03_index_has_og_url_pointing_to_eastsea_monster', () => {
  const match = indexHtml.match(/<meta\b[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["'][^>]*>/i);

  assert.ok(match, 'index.html is missing og:url meta tag');
  assert.match(match[1], /eastsea\.monster/i, `og:url does not point to eastsea.monster: ${match[1]}`);
});

test('tc_iC_04_index_has_og_image_meta', () => {
  assert.match(
    indexHtml,
    /<meta\b[^>]*property=["']og:image["'][^>]*content=["'][^"']+["'][^>]*>/i,
    'index.html is missing og:image meta tag',
  );
});

test('tc_iC_05_index_has_twitter_card_meta', () => {
  assert.match(
    indexHtml,
    /<meta\b[^>]*name=["']twitter:card["'][^>]*content=["'][^"']+["'][^>]*>/i,
    'index.html is missing twitter:card meta tag',
  );
});

test('tc_iC_06_index_has_canonical_link', () => {
  assert.match(
    indexHtml,
    /<link\b[^>]*rel=["']canonical["'][^>]*href=["'][^"']+["'][^>]*>/i,
    'index.html is missing canonical link',
  );
});

test('tc_iC_07_index_has_json_ld_structured_data', () => {
  const jsonLdMatch = indexHtml.match(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);

  assert.ok(jsonLdMatch, 'index.html is missing JSON-LD script block');
  assert.match(jsonLdMatch[1], /"@context"\s*:/i, 'JSON-LD block does not contain @context');
});

test('tc_iC_08_robots_txt_exists_and_has_content', () => {
  assert.ok(fileExists('robots.txt'), 'robots.txt does not exist');

  const robots = readText('robots.txt').trim();
  assert.ok(robots.length > 0, 'robots.txt is empty');
});

test('tc_iC_09_sitemap_exists_and_contains_valid_xml_structure', () => {
  assert.ok(fileExists('sitemap.xml'), 'sitemap.xml does not exist');

  const sitemap = readText('sitemap.xml').trim();
  assert.match(sitemap, /^<\?xml\s+/i, 'sitemap.xml is missing XML declaration');
  assert.ok(
    sitemap.includes('<urlset') || sitemap.includes('<sitemapindex'),
    'sitemap.xml must contain <urlset> or <sitemapindex>',
  );
});

test('tc_iC_10_cname_contains_eastsea_monster', () => {
  assert.ok(fileExists('CNAME'), 'CNAME file does not exist');

  const cname = readText('CNAME').trim();
  assert.equal(cname, 'eastsea.monster', `CNAME expected "eastsea.monster" but found "${cname}"`);
});
