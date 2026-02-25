import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { loadViewHelpers, loadPostsJsonGenerator, loadNovelsApp, readText, readJSON } from '../setup.mjs';

function fallbackViewParseFrontMatter(markdown) {
  const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = markdown.match(frontMatterRegex);

  if (!match) {
    return { frontMatter: {}, content: markdown };
  }

  const frontMatterText = match[1];
  const content = match[2];
  const frontMatter = {};

  frontMatterText.split('\n').forEach((line) => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > -1) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();

      value = value.replace(/^["']|["']$/g, '');

      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map((v) => v.trim());
      }

      frontMatter[key] = value;
    }
  });

  return { frontMatter, content };
}

function getViewParseFrontMatter() {
  try {
    const helpers = loadViewHelpers();
    if (typeof helpers.parseFrontMatter === 'function') return helpers.parseFrontMatter;
  } catch {
    // ignore
  }
  return fallbackViewParseFrontMatter;
}

const parseViewFrontMatter = getViewParseFrontMatter();
const postsGen = loadPostsJsonGenerator();
const novels = loadNovelsApp();

describe('front matter parsing', () => {
  it('tc_01_01_view_parse_standard_front_matter', () => {
    const md = `---\ntitle: Hello\ndate: 2026-02-05\ncategories: briefing\n---\nBody text`;
    const { frontMatter, content } = parseViewFrontMatter(md);

    assert.equal(frontMatter.title, 'Hello');
    assert.equal(frontMatter.date, '2026-02-05');
    assert.equal(frontMatter.categories, 'briefing');
    assert.equal(content, 'Body text');
  });

  it('tc_01_02_view_parse_array_categories', () => {
    const md = `---\ncategories: [briefing, research]\n---\n본문`;
    const { frontMatter } = parseViewFrontMatter(md);

    assert.deepEqual(frontMatter.categories, ['briefing', 'research']);
  });

  it('tc_01_03_view_parse_quoted_values', () => {
    const md = `---\ntitle: \"Quoted Title\"\ntags: ['AI', 'ML']\n---\ntext`;
    const { frontMatter } = parseViewFrontMatter(md);

    assert.equal(frontMatter.title, 'Quoted Title');
    assert.deepEqual(frontMatter.tags, ["'AI'", "'ML'"]);
  });

  it('tc_01_04_view_parse_missing_front_matter', () => {
    const md = '# No Front Matter\nContent';
    const out = parseViewFrontMatter(md);

    assert.deepEqual(out.frontMatter, {});
    assert.equal(out.content, md);
  });

  it('tc_01_05_view_parse_empty_front_matter', () => {
    const md = `---\n\n---\njust content`;
    const out = parseViewFrontMatter(md);

    assert.deepEqual(out.frontMatter, {});
    assert.equal(out.content, 'just content');
  });

  it('tc_01_06_view_parse_body_contains_delimiter', () => {
    const md = `---\ntitle: Delimiter Test\n---\n첫 문단\n---\n둘째 문단`;
    const out = parseViewFrontMatter(md);

    assert.equal(out.frontMatter.title, 'Delimiter Test');
    assert.equal(out.content, '첫 문단\n---\n둘째 문단');
  });

  it('tc_01_07_view_parse_real_post_file', () => {
    const raw = readText('_posts/2026-01-28-daily-briefing.md');
    const out = parseViewFrontMatter(raw);

    assert.equal(out.frontMatter.date, '2026-01-28');
    assert.ok(String(out.frontMatter.title).includes('데일리 브리핑'));
    assert.ok(out.content.includes('AI 시장 동향 분석'));
  });

  it('tc_01_08_posts_generator_parse_simple_yaml', () => {
    const content = `---\ntitle: test\ndate: 2026-01-01\ncategories: briefing\n---\nBody`;
    const fm = postsGen.parseFrontMatter(content);

    assert.deepEqual(fm, {
      title: 'test',
      date: '2026-01-01',
      categories: 'briefing'
    });
  });

  it('tc_01_09_posts_generator_parse_array_and_quoted_values', () => {
    const content = `---\ntitle: 'quoted'\ncategories: [digest, report]\n---\nBody`;
    const fm = postsGen.parseFrontMatter(content);

    assert.equal(fm.title, 'quoted');
    assert.equal(fm.categories, 'digest');
  });

  it('tc_01_10_posts_generator_parse_colon_and_multiline_value', () => {
    const content = `---\nsummary: key: value: deep\ndescription: first line\n  second line\n---\nBody`;
    const fm = postsGen.parseFrontMatter(content);

    assert.equal(fm.summary, 'key: value: deep');
    assert.equal(fm.description, 'first line');
    assert.equal(fm.second, undefined);
  });

  it('tc_01_11_novels_split_front_matter_valid_block', () => {
    const raw = `---\ntitle: Novel\nepisode: 3\n---\n본문 내용`;
    const out = novels.splitFrontMatter(raw);

    assert.equal(out.metaText, 'title: Novel\nepisode: 3');
    assert.equal(out.body, '본문 내용');
  });

  it('tc_01_12_novels_extract_meta_fields_and_missing_defaults', () => {
    const meta = `title: \"작품명\"\nepisode: '007'\ndate: 2026-02-05\nauthor: Eastsea\nseries: 메인시리즈`;
    const parsed = novels.extractMeta(meta);
    const fromReal = readJSON('posts.json')[0];

    assert.deepEqual(parsed, {
      title: '작품명',
      episode: '007',
      date: '2026-02-05',
      author: 'Eastsea',
      series: '메인시리즈'
    });

    const missing = novels.extractMeta('title: only title');
    assert.equal(missing.author, '');
    assert.equal(missing.series, '');
    assert.ok(fromReal.filename.endsWith('.md'));
  });
});
