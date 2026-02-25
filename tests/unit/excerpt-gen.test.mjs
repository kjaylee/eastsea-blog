import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { loadPostsJsonGenerator, readJSON, readText } from '../setup.mjs';

const postsGen = loadPostsJsonGenerator();

function withFrontMatter(body) {
  return `---\ntitle: sample\n---\n${body}`;
}

describe('excerpt generation', () => {
  it('tc_06_01_extract_excerpt_from_normal_markdown', () => {
    const content = withFrontMatter('\n이 문장은 충분히 길어서 첫 번째 의미 있는 문단으로 선택되어야 합니다. 테스트를 위해 30자를 넘깁니다.');
    const excerpt = postsGen.extractExcerpt(content);

    assert.ok(excerpt.startsWith('이 문장은 충분히 길어서'));
    assert.ok(excerpt.endsWith('...'));
  });

  it('tc_06_02_extract_excerpt_prefers_blockquote_line', () => {
    const content = withFrontMatter('\n> 인용문이 충분히 길게 작성되어 요약문으로 선택됩니다. 이 문장은 길이 조건을 만족합니다.\n\n일반 문단도 충분히 길지만 두 번째입니다.');
    const excerpt = postsGen.extractExcerpt(content);

    assert.ok(excerpt.startsWith('인용문이 충분히 길게 작성되어'));
  });

  it('tc_06_03_extract_excerpt_skips_short_lines', () => {
    const content = withFrontMatter('\n짧다\n또짧다\n이 줄은 충분히 길어서 요약에 선택되어야 하는 본문 문장입니다. 길이를 의도적으로 늘렸습니다.');
    const excerpt = postsGen.extractExcerpt(content);

    assert.ok(excerpt.startsWith('이 줄은 충분히 길어서 요약에 선택되어야'));
  });

  it('tc_06_04_extract_excerpt_skips_headers', () => {
    const content = withFrontMatter('\n# 큰 제목\n## 작은 제목\n이 문단은 헤더 이후에 등장하는 첫 번째 긴 문단으로 요약 대상이어야 합니다. 충분히 깁니다.');
    const excerpt = postsGen.extractExcerpt(content);

    assert.ok(!excerpt.startsWith('#'));
    assert.ok(excerpt.startsWith('이 문단은 헤더 이후에 등장하는'));
  });

  it('tc_06_05_extract_excerpt_skips_metadata_like_lines', () => {
    const content = withFrontMatter('\nlayout: post\ntitle: 내부 제목\ndate: 2026-02-01\ncategories: briefing\n이 본문은 메타데이터 형태 줄을 건너뛴 뒤 선택되는 실제 콘텐츠 문장입니다. 충분히 깁니다.');
    const excerpt = postsGen.extractExcerpt(content);

    assert.ok(excerpt.startsWith('이 본문은 메타데이터 형태 줄을 건너뛴'));
  });

  it('tc_06_06_extract_excerpt_strips_basic_markdown_tokens', () => {
    const content = withFrontMatter('\n이 문장은 **굵게**, _기울임_, `코드` 형식을 포함하고 있으며 충분히 길어서 테스트에 사용됩니다.');
    const excerpt = postsGen.extractExcerpt(content);

    assert.ok(!excerpt.includes('**'));
    assert.ok(!excerpt.includes('_'));
    assert.ok(!excerpt.includes('`'));
    assert.ok(excerpt.includes('굵게'));
  });

  it('tc_06_07_extract_excerpt_link_brackets_removed_by_cleanup', () => {
    const content = withFrontMatter('\n이 문장은 [링크텍스트](https://example.com) 를 포함하고 있고 길이 조건을 충족합니다. 요약 생성 동작을 확인합니다.');
    const excerpt = postsGen.extractExcerpt(content);

    assert.ok(!excerpt.includes('['));
    assert.ok(!excerpt.includes(']'));
    assert.ok(excerpt.includes('링크텍스트(https://example.com)'));
  });

  it('tc_06_08_extract_excerpt_truncates_to_120_plus_ellipsis', () => {
    const longLine = '가'.repeat(150);
    const content = withFrontMatter(`\n${longLine}`);
    const excerpt = postsGen.extractExcerpt(content);

    assert.equal(excerpt.length, 123);
    assert.equal(excerpt, `${'가'.repeat(120)}...`);
  });

  it('tc_06_09_extract_excerpt_empty_content_uses_default_message', () => {
    const content = withFrontMatter('\n\n');
    const excerpt = postsGen.extractExcerpt(content);

    assert.equal(excerpt, '더 읽기......');
  });

  it('tc_06_10_extract_excerpt_matches_real_posts_json_entry', () => {
    const posts = readJSON('posts.json');
    const sample = posts[0];
    const raw = readText(`_posts/${sample.filename}`);
    const excerpt = postsGen.extractExcerpt(raw);

    assert.equal(excerpt, sample.excerpt);
  });
});
