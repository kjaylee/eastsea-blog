import test from 'node:test';
import assert from 'node:assert/strict';
import { fileExists, readText } from '../setup.mjs';

const htmlFiles = [
  'index.html',
  'about.html',
  'contact.html',
  'privacy.html',
  'terms.html',
  'view.html',
  'hotdeal/index.html',
  'novels/index.html',
  'tools/index.html',
  'games/index.html',
];

const docs = htmlFiles.map((path) => ({ path, html: fileExists(path) ? readText(path) : '' }));

test('tc_html_validity_01_major_html_files_exist', () => {
  for (const file of htmlFiles) {
    assert.ok(fileExists(file), `Missing HTML file: ${file}`);
  }
});

test('tc_html_validity_02_each_file_has_doctype', () => {
  for (const { path, html } of docs) {
    assert.match(html.slice(0, 120).toLowerCase(), /<!doctype html>/, `${path} missing doctype`);
  }
});

test('tc_html_validity_03_each_file_has_html_head_body_structure', () => {
  for (const { path, html } of docs) {
    const normalized = html.toLowerCase();
    assert.match(normalized, /<html[^>]*>/, `${path} missing <html>`);
    assert.match(normalized, /<head[\s>]/, `${path} missing <head>`);
    assert.match(normalized, /<\/head>/, `${path} missing </head>`);
    assert.match(normalized, /<body[\s>]/, `${path} missing <body>`);
    assert.match(normalized, /<\/body>/, `${path} missing </body>`);
    assert.match(normalized, /<\/html>/, `${path} missing </html>`);
  }
});

test('tc_html_validity_04_each_file_has_single_non_empty_title', () => {
  for (const { path, html } of docs) {
    const titles = [...html.matchAll(/<title>([\s\S]*?)<\/title>/gi)].map((m) => m[1].trim());
    assert.equal(titles.length, 1, `${path} should contain exactly one <title>`);
    assert.ok(titles[0].length > 0, `${path} has empty title`);
  }
});

test('tc_html_validity_05_html_tag_has_lang_attribute', () => {
  for (const { path, html } of docs) {
    assert.match(html, /<html[^>]*\slang=["'][^"']+["'][^>]*>/i, `${path} missing html lang attribute`);
  }
});
