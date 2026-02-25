import test from 'node:test';
import assert from 'node:assert/strict';
import { readText, fileExists } from '../setup.mjs';

const MAIN_HTML_FILES = [
  'index.html',
  'view.html',
  'hotdeal/index.html',
  'novels/index.html',
  'about.html',
  'privacy.html',
  'terms.html',
  'contact.html',
];

function assertHtmlStructure(relPath) {
  const html = readText(relPath);

  assert.match(html, /<!doctype\s+html>/i, `${relPath} is missing <!DOCTYPE html>`);
  assert.match(html, /<html\b[^>]*>/i, `${relPath} is missing <html> tag`);
  assert.match(html, /<head\b[^>]*>/i, `${relPath} is missing <head> tag`);
  assert.match(html, /<body\b[^>]*>/i, `${relPath} is missing <body> tag`);
}

test('tc_iB_01_index_has_basic_html_structure', () => {
  assertHtmlStructure('index.html');
});

test('tc_iB_02_index_has_non_empty_title', () => {
  const html = readText('index.html');
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);

  assert.ok(match, 'index.html is missing <title>');
  assert.ok(match[1].trim().length > 0, 'index.html <title> is empty');
});

test('tc_iB_03_view_has_valid_html_structure', () => {
  assertHtmlStructure('view.html');
});

test('tc_iB_04_hotdeal_index_has_valid_html_structure', () => {
  assertHtmlStructure('hotdeal/index.html');
});

test('tc_iB_05_novels_index_has_valid_html_structure', () => {
  assertHtmlStructure('novels/index.html');
});

test('tc_iB_06_about_exists_and_has_valid_html_structure', () => {
  assert.ok(fileExists('about.html'), 'about.html does not exist');
  assertHtmlStructure('about.html');
});

test('tc_iB_07_privacy_exists_and_has_valid_html_structure', () => {
  assert.ok(fileExists('privacy.html'), 'privacy.html does not exist');
  assertHtmlStructure('privacy.html');
});

test('tc_iB_08_terms_exists_and_has_valid_html_structure', () => {
  assert.ok(fileExists('terms.html'), 'terms.html does not exist');
  assertHtmlStructure('terms.html');
});

test('tc_iB_09_contact_exists_and_has_valid_html_structure', () => {
  assert.ok(fileExists('contact.html'), 'contact.html does not exist');
  assertHtmlStructure('contact.html');
});

test('tc_iB_10_all_main_html_files_have_utf8_charset_meta', () => {
  for (const relPath of MAIN_HTML_FILES) {
    const html = readText(relPath);
    assert.match(
      html,
      /<meta\b[^>]*charset=["']?utf-8["']?[^>]*>/i,
      `${relPath} is missing UTF-8 charset meta tag`,
    );
  }
});

test('tc_iB_11_all_main_html_files_have_viewport_meta', () => {
  for (const relPath of MAIN_HTML_FILES) {
    const html = readText(relPath);
    assert.match(
      html,
      /<meta\b[^>]*name=["']viewport["'][^>]*content=["'][^"']+["'][^>]*>/i,
      `${relPath} is missing viewport meta tag`,
    );
  }
});

test('tc_iB_12_no_unclosed_script_tags_in_main_html_files', () => {
  for (const relPath of MAIN_HTML_FILES) {
    const html = readText(relPath);
    const openTags = (html.match(/<script\b/gi) || []).length;
    const closeTags = (html.match(/<\/script>/gi) || []).length;

    assert.equal(
      openTags,
      closeTags,
      `${relPath} has mismatched <script> tags: opened=${openTags}, closed=${closeTags}`,
    );
  }
});
