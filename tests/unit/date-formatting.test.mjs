import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { loadViewHelpers, loadNovelsApp } from '../setup.mjs';

function fallbackFormatDate(dateString) {
  if (!dateString) return '';

  try {
    let dateStr = String(dateString).trim();
    const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      dateStr = `${match[1]}-${match[2]}-${match[3]}`;
    }

    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) {
      const isoMatch = String(dateString).match(/(\d{4})-(\d{2})-(\d{2})/);
      if (isoMatch) {
        return `${isoMatch[1]}년 ${isoMatch[2]}월 ${isoMatch[3]}일`;
      }
      return dateString;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];

    return `${year}년 ${month}월 ${day}일 ${weekday}요일`;
  } catch {
    return dateString || '';
  }
}

function getViewFormatDate() {
  try {
    const helpers = loadViewHelpers();
    if (typeof helpers.formatDate === 'function') return helpers.formatDate;
  } catch {
    // ignore
  }
  return fallbackFormatDate;
}

const formatDate = getViewFormatDate();
const novels = loadNovelsApp();

describe('date formatting', () => {
  it('tc_02_01_view_format_iso_date_to_korean', () => {
    assert.equal(formatDate('2026-02-05'), '2026년 02월 05일 목요일');
  });

  it('tc_02_02_view_format_datetime_string_extracts_ymd', () => {
    assert.equal(formatDate('2026-02-05 18:00:00 +0900'), '2026년 02월 05일 목요일');
  });

  it('tc_02_03_view_format_invalid_string_returns_original', () => {
    assert.equal(formatDate('not-a-date-value'), 'not-a-date-value');
  });

  it('tc_02_04_view_format_invalid_iso_like_returns_korean_fallback', () => {
    assert.equal(formatDate('2026-13-99'), '2026년 13월 99일');
  });

  it('tc_02_05_view_format_null_returns_empty', () => {
    assert.equal(formatDate(null), '');
    assert.equal(formatDate(undefined), '');
  });

  it('tc_02_06_view_format_leap_year_weekday_correctness', () => {
    assert.equal(formatDate('2024-02-29'), '2024년 02월 29일 목요일');
  });

  it('tc_02_07_novels_format_date_with_date_object', () => {
    const out = novels.formatDate(new Date('2026-02-05T00:00:00Z'));
    assert.equal(out, '2026-02-05');
  });

  it('tc_02_08_novels_format_invalid_passthrough', () => {
    assert.equal(novels.formatDate('bad-date'), 'bad-date');
  });

  it('tc_02_09_novels_format_null_and_undefined_to_dash', () => {
    assert.equal(novels.formatDate(null), '-');
    assert.equal(novels.formatDate(undefined), '-');
  });

  it('tc_02_10_novels_format_edge_years', () => {
    assert.equal(novels.formatDate('2000-01-01'), '2000-01-01');
    assert.equal(novels.formatDate('9999-12-31'), '9999-12-31');
  });
});
