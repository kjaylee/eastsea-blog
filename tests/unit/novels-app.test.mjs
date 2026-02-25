import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { loadNovelsApp } from '../setup.mjs';

const novels = loadNovelsApp();

describe('NovelsApp pure functions', () => {
  it('tc_03_01_norm_ep_number_to_three_digits', () => {
    assert.equal(novels.normEp(1), '001');
  });

  it('tc_03_02_norm_ep_string_to_three_digits', () => {
    assert.equal(novels.normEp('42'), '042');
  });

  it('tc_03_03_norm_ep_undefined_to_zero_padded', () => {
    assert.equal(novels.normEp(undefined), '000');
  });

  it('tc_03_04_clean_episode_title_strips_prefix_and_suffix', () => {
    const raw = '[웹소설] 카페 사장님은 전생자입니다 - 4화';
    assert.equal(novels.cleanEpisodeTitle(raw, 4), '카페 사장님은 전생자입니다');
  });

  it('tc_03_05_clean_episode_title_keeps_plain_title', () => {
    assert.equal(novels.cleanEpisodeTitle('달빛이 내리는 정원', 1), '달빛이 내리는 정원');
  });

  it('tc_03_06_clean_episode_title_empty_to_fallback', () => {
    assert.equal(novels.cleanEpisodeTitle('', 3), '제3화');
  });

  it('tc_03_07_clean_episode_title_null_to_fallback', () => {
    assert.equal(novels.cleanEpisodeTitle(null, 5), '제5화');
  });

  it('tc_03_08_get_cover_path_basic_slug', () => {
    assert.equal(novels.getCoverPath('test-novel'), 'covers/test-novel.png');
  });

  it('tc_03_09_get_cover_path_url_encodes_unicode_slug', () => {
    assert.equal(novels.getCoverPath('한글 소설'), 'covers/%ED%95%9C%EA%B8%80%20%EC%86%8C%EC%84%A4.png');
  });

  it('tc_03_10_get_episode_path_pads_and_encodes', () => {
    assert.equal(novels.getEpisodePath('my novel', 3), '_data/my%20novel-003.md');
  });

  it('tc_03_11_split_front_matter_valid_document', () => {
    const raw = `---\r\ntitle: 테스트\r\nepisode: 001\r\n---\r\n본문입니다.`;
    const out = novels.splitFrontMatter(raw);

    assert.equal(out.metaText, 'title: 테스트\r\nepisode: 001');
    assert.equal(out.body, '본문입니다.');
  });

  it('tc_03_12_split_front_matter_without_block_returns_raw_body', () => {
    const raw = 'front matter 없음\n본문';
    const out = novels.splitFrontMatter(raw);

    assert.equal(out.metaText, '');
    assert.equal(out.body, raw);
  });

  it('tc_03_13_extract_meta_all_fields', () => {
    const metaText = `title: \"작품명\"\nepisode: '010'\ndate: 2026-02-05\nauthor: Eastsea\nseries: Main Arc`;
    const meta = novels.extractMeta(metaText);

    assert.deepEqual(meta, {
      title: '작품명',
      episode: '010',
      date: '2026-02-05',
      author: 'Eastsea',
      series: 'Main Arc'
    });
  });

  it('tc_03_14_extract_meta_missing_fields_to_empty_strings', () => {
    const meta = novels.extractMeta('title: only title');

    assert.equal(meta.title, 'only title');
    assert.equal(meta.episode, '');
    assert.equal(meta.date, '');
    assert.equal(meta.author, '');
    assert.equal(meta.series, '');
  });

  it('tc_03_15_markdown_to_synopsis_strips_markdown_and_handles_empty', () => {
    const markdown = `---\ntitle: sample\n---\n\n# 헤더\n\n**첫 번째 문단**은 [링크](https://example.com)와 \`코드\`를 포함하며 충분히 길어서 요약 대상이 됩니다.\n\n\`\`\`js\nconst x = 1;\n\`\`\`\n\n두 번째 문단도 길이를 충분히 확보하여 요약에 포함될 수 있도록 작성합니다. 이 문장은 테스트를 위해 길게 작성합니다.\n\n세 번째 문단은 잘려야 합니다.`;

    const synopsis = novels.markdownToSynopsis(markdown);
    assert.ok(!synopsis.includes('**'));
    assert.ok(!synopsis.includes('['));
    assert.ok(!synopsis.includes('```'));
    assert.ok(synopsis.includes('첫 번째 문단은 링크와 코드를 포함하며'));
    assert.ok(synopsis.includes('두 번째 문단도 길이를 충분히 확보하여'));

    const fallback = novels.markdownToSynopsis('짧음\n\n또 짧음');
    assert.equal(fallback, '작품 소개가 준비 중입니다.');
  });
});
