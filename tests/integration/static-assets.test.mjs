import test from 'node:test';
import assert from 'node:assert/strict';
import { statSync } from 'node:fs';
import { join } from 'node:path';
import { BLOG_ROOT, readText, listDir, fileExists } from '../setup.mjs';

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

test('tc_iF_01_favicon_ico_exists', () => {
  assert.ok(fileExists('assets/favicon.ico'), 'favicon.ico does not exist in assets/');
});

test('tc_iF_02_favicon_png_exists', () => {
  assert.ok(fileExists('assets/favicon.png'), 'favicon.png does not exist in assets/');
});

test('tc_iF_03_assets_directory_has_css_and_js_subdirectories', () => {
  assert.ok(fileExists('assets'), 'assets/ directory does not exist');
  assert.ok(fileExists('assets/css'), 'assets/css/ directory does not exist');
  assert.ok(fileExists('assets/js'), 'assets/js/ directory does not exist');
});

test('tc_iF_04_nojekyll_file_exists', () => {
  assert.ok(fileExists('.nojekyll'), '.nojekyll file does not exist');
});

test('tc_iF_05_gitignore_file_exists', () => {
  assert.ok(fileExists('.gitignore'), '.gitignore file does not exist');
});

test('tc_iF_06_ads_txt_exists', () => {
  assert.ok(fileExists('ads.txt'), 'ads.txt file does not exist');
});

test('tc_iF_07_no_large_files_over_5mb_in_root_or_first_level_directories', () => {
  const MAX_BYTES = 5 * 1024 * 1024;
  const rootEntries = listDir('');

  for (const name of rootEntries) {
    const absPath = join(BLOG_ROOT, name);
    const stat = statSync(absPath);

    if (stat.isFile()) {
      assert.ok(stat.size <= MAX_BYTES, `File exceeds 5MB: ${name} (${stat.size} bytes)`);
      continue;
    }

    if (!stat.isDirectory() || name.startsWith('.')) continue;

    const childEntries = listDir(name);
    for (const child of childEntries) {
      const childRelPath = `${name}/${child}`;
      const childAbsPath = join(BLOG_ROOT, childRelPath);
      const childStat = statSync(childAbsPath);

      if (childStat.isFile()) {
        assert.ok(
          childStat.size <= MAX_BYTES,
          `File exceeds 5MB at first-level depth: ${childRelPath} (${childStat.size} bytes)`,
        );
      }
    }
  }
});

test('tc_iF_08_external_stylesheet_cdn_links_use_https', () => {
  for (const relPath of MAIN_HTML_FILES) {
    const html = readText(relPath);
    const matches = html.matchAll(
      /<link\b[^>]*rel=["'][^"']*stylesheet[^"']*["'][^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>/gi,
    );

    for (const match of matches) {
      const url = match[1];
      assert.ok(url.startsWith('https://'), `${relPath} has non-HTTPS stylesheet URL: ${url}`);
    }
  }
});

test('tc_iF_09_visit_counter_js_exists', () => {
  assert.ok(fileExists('assets/js/visit-counter.js'), 'assets/js/visit-counter.js does not exist');
});

test('tc_iF_10_novel_js_exists', () => {
  assert.ok(fileExists('assets/js/novel.js'), 'assets/js/novel.js does not exist');
});
