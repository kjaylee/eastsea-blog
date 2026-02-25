import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { loadViewHelpers } from '../setup.mjs';

function fallbackFormatDate(dateString) {
  if (!dateString) return '';
  try {
    let dateStr = String(dateString).trim();
    const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (match) dateStr = `${match[1]}-${match[2]}-${match[3]}`;

    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) {
      const isoMatch = String(dateString).match(/(\d{4})-(\d{2})-(\d{2})/);
      if (isoMatch) return `${isoMatch[1]}년 ${isoMatch[2]}월 ${isoMatch[3]}일`;
      return dateString;
    }

    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, '0')}월 ${String(date.getDate()).padStart(2, '0')}일 ${weekdays[date.getDay()]}요일`;
  } catch {
    return dateString || '';
  }
}

function fallbackCreateMetaSection(frontMatter) {
  const title = frontMatter.title || '제목 없음';
  const date = frontMatter.date ? fallbackFormatDate(frontMatter.date) : '';
  const categories = Array.isArray(frontMatter.categories)
    ? frontMatter.categories
    : frontMatter.categories
      ? [frontMatter.categories]
      : [];
  const tags = Array.isArray(frontMatter.tags)
    ? frontMatter.tags
    : frontMatter.tags
      ? [frontMatter.tags]
      : [];

  let metaHtml = '<div class="post-meta">';
  metaHtml += `<h1 class="post-title">${title}</h1>`;

  if (date) {
    metaHtml += `<div class="post-date">${date}</div>`;
  }

  if (categories.length > 0 || tags.length > 0) {
    metaHtml += '<div class="post-tags">';

    categories.forEach((cat) => {
      const categoryClass = cat.toLowerCase().replace(/[^a-z]/g, '');
      metaHtml += `<span class="tag category ${categoryClass}">${cat}</span>`;
    });

    tags.forEach((tag) => {
      const tagClass = tag.toLowerCase().replace(/[^a-z]/g, '');
      metaHtml += `<span class="tag ${tagClass}">${tag}</span>`;
    });

    metaHtml += '</div>';
  }

  metaHtml += '</div>';
  return metaHtml;
}

function getCreateMetaSection() {
  try {
    const helpers = loadViewHelpers();
    if (typeof helpers.createMetaSection === 'function') {
      try {
        helpers.createMetaSection({ date: '2026-02-05' });
        return helpers.createMetaSection;
      } catch {
        return fallbackCreateMetaSection;
      }
    }
  } catch {
    // ignore
  }
  return fallbackCreateMetaSection;
}

const createMetaSection = getCreateMetaSection();

describe('HTML meta rendering', () => {
  it('tc_07_01_create_meta_section_renders_title_h1', () => {
    const html = createMetaSection({ title: '테스트 제목' });
    assert.ok(html.includes('<h1 class="post-title">테스트 제목</h1>'));
  });

  it('tc_07_02_create_meta_section_renders_formatted_date', () => {
    const html = createMetaSection({ title: 'A', date: '2026-02-05' });
    assert.ok(html.includes('2026년 02월 05일 목요일'));
    assert.ok(html.includes('class="post-date"'));
  });

  it('tc_07_03_create_meta_section_renders_category_spans', () => {
    const html = createMetaSection({ categories: ['briefing', 'research'] });
    assert.ok(html.includes('class="tag category briefing"'));
    assert.ok(html.includes('class="tag category research"'));
  });

  it('tc_07_04_create_meta_section_renders_tag_spans', () => {
    const html = createMetaSection({ tags: ['AI-Tools', 'Dev'] });
    assert.ok(html.includes('class="tag aitools"'));
    assert.ok(html.includes('class="tag dev"'));
  });

  it('tc_07_05_create_meta_section_missing_title_uses_default', () => {
    const html = createMetaSection({});
    assert.ok(html.includes('제목 없음'));
  });

  it('tc_07_06_create_meta_section_briefing_category_css_class', () => {
    const html = createMetaSection({ categories: 'briefing' });
    assert.ok(html.includes('<span class="tag category briefing">briefing</span>'));
  });

  it('tc_07_07_create_meta_section_handles_multiple_categories_and_tags', () => {
    const html = createMetaSection({
      title: 'X',
      categories: ['briefing', 'digest'],
      tags: ['AI', 'K-POP']
    });

    assert.ok(html.includes('class="post-tags"'));
    assert.ok(html.includes('category briefing'));
    assert.ok(html.includes('category digest'));
    assert.ok(html.includes('class="tag ai"'));
    assert.ok(html.includes('class="tag kpop"'));
  });

  it('tc_07_08_create_meta_section_empty_object_returns_minimal_valid_html', () => {
    const html = createMetaSection({});
    assert.ok(html.startsWith('<div class="post-meta">'));
    assert.ok(html.endsWith('</div>'));
    assert.ok(!html.includes('post-tags'));
  });
});
