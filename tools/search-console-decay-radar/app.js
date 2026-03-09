(function (global, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.SearchConsoleDecayRadar = api;
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    window.addEventListener('DOMContentLoaded', function () {
      api.initBrowser();
    });
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DAY_MS = 24 * 60 * 60 * 1000;
  const PARTIAL_WARNING = 'Uploaded CSV may be partial due to GSC export row limits.';
  const REQUIRED_KEYS = ['date', 'page', 'clicks', 'impressions', 'position'];
  const HEADER_ALIASES = {
    date: ['date', 'Date', '날짜'],
    page: ['page', 'Page', 'Top pages', '페이지'],
    clicks: ['clicks', 'Clicks', '클릭수'],
    impressions: ['impressions', 'Impressions', '노출수'],
    ctr: ['ctr', 'CTR', '평균 CTR'],
    position: ['position', 'Position', 'Average position', '평균 게재순위'],
  };
  const PRIMARY_REASON_PRIORITY = ['possible-deindex', 'rank-down', 'ctr-down', 'demand-down'];
  const REFRESH_ACTIONS = {
    'possible-deindex': {
      key: 'technical-check',
      label: 'Check indexing, canonicals, robots, and recent template changes before refreshing content.',
    },
    'rank-down': {
      key: 'refresh-intent',
      label: 'Refresh headings, examples, and internal links to better match current search intent.',
    },
    'ctr-down': {
      key: 'rewrite-snippet',
      label: 'Rewrite title and meta description, tighten the intro, and improve snippet clarity.',
    },
    'demand-down': {
      key: 'update-freshness',
      label: 'Update stale sections, dates, examples, and external references to restore freshness.',
    },
    'mixed-decay': {
      key: 'full-refresh',
      label: 'Run a full refresh: improve intent coverage, update facts, and rework snippet hooks.',
    },
  };
  const TABLE_COLUMNS = [
    { key: 'rank', label: 'Rank', type: 'number' },
    { key: 'url', label: 'URL', type: 'string' },
    { key: 'decayScore', label: 'Decay score', type: 'number' },
    { key: 'clickLoss', label: 'Click loss', type: 'number' },
    { key: 'prevClicks', label: 'Prev clicks', type: 'number' },
    { key: 'recentClicks', label: 'Recent clicks', type: 'number' },
    { key: 'prevImpressions', label: 'Prev impressions', type: 'number' },
    { key: 'recentImpressions', label: 'Recent impressions', type: 'number' },
    { key: 'prevCtr', label: 'Prev CTR', type: 'percent' },
    { key: 'recentCtr', label: 'Recent CTR', type: 'percent' },
    { key: 'prevPosition', label: 'Prev position', type: 'number' },
    { key: 'recentPosition', label: 'Recent position', type: 'number' },
    { key: 'primaryReason', label: 'Primary reason', type: 'string' },
    { key: 'reasonTags', label: 'Reason tags', type: 'tags' },
    { key: 'refreshAction', label: 'Refresh action', type: 'string' },
  ];

  const headerLookup = Object.create(null);
  Object.keys(HEADER_ALIASES).forEach(function (logicalKey) {
    HEADER_ALIASES[logicalKey].forEach(function (alias) {
      headerLookup[normalizeHeader(alias)] = logicalKey;
    });
  });

  function normalizeHeader(value) {
    return String(value || '')
      .replace(/^\uFEFF/, '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  }

  function stripBom(text) {
    return String(text || '').replace(/^\uFEFF/, '');
  }

  function parseCsv(text) {
    const rows = [];
    let current = '';
    let row = [];
    let inQuotes = false;
    const source = stripBom(text).replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    for (let index = 0; index < source.length; index += 1) {
      const char = source[index];
      const next = source[index + 1];
      if (char === '"') {
        if (inQuotes && next === '"') {
          current += '"';
          index += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(current);
        current = '';
      } else if (char === '\n' && !inQuotes) {
        row.push(current);
        if (row.some(function (cell) { return String(cell).trim() !== ''; })) {
          rows.push(row);
        }
        row = [];
        current = '';
      } else {
        current += char;
      }
    }

    row.push(current);
    if (row.some(function (cell) { return String(cell).trim() !== ''; })) {
      rows.push(row);
    }

    return rows;
  }

  function parseDateCell(value) {
    const text = String(value || '').trim();
    const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) {
      return null;
    }
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      return null;
    }
    return date;
  }

  function formatDate(date) {
    return new Date(date.getTime()).toISOString().slice(0, 10);
  }

  function addDays(date, days) {
    return new Date(date.getTime() + days * DAY_MS);
  }

  function parseNumberCell(value) {
    const text = String(value || '').trim();
    if (!text) return null;
    const cleaned = text.replace(/,/g, '').replace(/%/g, '').trim();
    if (!cleaned) return null;
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : null;
  }

  function roundTo(value, decimals) {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeCsvCell(value) {
    const text = String(value == null ? '' : value);
    if (/[",\n]/.test(text)) {
      return '"' + text.replace(/"/g, '""') + '"';
    }
    return text;
  }

  function parseCsvText(csvText) {
    const matrix = parseCsv(csvText);
    if (!matrix.length) {
      return { ok: false, error: 'CSV is empty.' };
    }

    const headers = matrix[0].map(function (header) {
      return String(header || '').trim();
    });
    const logicalColumns = {};

    headers.forEach(function (header, index) {
      const logicalKey = headerLookup[normalizeHeader(header)];
      if (logicalKey && logicalColumns[logicalKey] == null) {
        logicalColumns[logicalKey] = index;
      }
    });

    const missingColumns = REQUIRED_KEYS.filter(function (key) {
      return logicalColumns[key] == null;
    });

    if (missingColumns.length) {
      return {
        ok: false,
        error: 'Missing required columns: ' + missingColumns.join(', ') + '.',
        missingColumns: missingColumns,
      };
    }

    const rows = [];
    let validRows = 0;
    let invalidRows = 0;
    const dataRows = matrix.slice(1).filter(function (cells) {
      return cells.some(function (cell) { return String(cell).trim() !== ''; });
    });

    dataRows.forEach(function (cells, dataIndex) {
      const raw = {};
      Object.keys(logicalColumns).forEach(function (key) {
        raw[key] = String(cells[logicalColumns[key]] || '').trim();
      });

      const date = parseDateCell(raw.date);
      const page = String(raw.page || '').trim();
      const clicks = parseNumberCell(raw.clicks);
      const impressions = parseNumberCell(raw.impressions);
      const position = parseNumberCell(raw.position);
      const ctr = raw.ctr ? parseNumberCell(raw.ctr) : null;
      const requiredInvalid = !date || !page || clicks == null || impressions == null || position == null;

      if (requiredInvalid) {
        invalidRows += 1;
        return;
      }

      validRows += 1;
      rows.push({
        rowNumber: dataIndex + 2,
        date: date,
        dateKey: formatDate(date),
        page: page,
        clicks: clicks,
        impressions: impressions,
        position: position,
        ctr: ctr,
      });
    });

    return {
      ok: true,
      parsedRows: dataRows.length,
      validRows: validRows,
      invalidRows: invalidRows,
      rows: rows,
      headers: headers,
      logicalColumns: logicalColumns,
    };
  }

  function createEmptyPeriodStats() {
    return {
      present: false,
      clicks: 0,
      impressions: 0,
      weightedPositionSum: 0,
    };
  }

  function finalizePeriod(period) {
    const ctr = period.impressions > 0 ? period.clicks / period.impressions : 0;
    const position = period.impressions > 0 ? period.weightedPositionSum / period.impressions : 0;
    return {
      clicks: roundTo(period.clicks, 6),
      impressions: roundTo(period.impressions, 6),
      ctr: roundTo(ctr, 6),
      position: roundTo(position, 6),
      present: period.present,
    };
  }

  function computeReasonTags(metrics, rates) {
    const tags = [];
    const positionDelta = metrics.recentPosition - metrics.prevPosition;
    if (metrics.recentImpressions <= 10 && metrics.prevImpressions >= 100) {
      tags.push('possible-deindex');
    }
    if (positionDelta >= 2) {
      tags.push('rank-down');
    }
    if (rates.ctrLossRate >= 0.25 && rates.impressionLossRate < 0.15 && positionDelta < 2) {
      tags.push('ctr-down');
    }
    if (rates.impressionLossRate >= 0.3 && positionDelta < 2) {
      tags.push('demand-down');
    }
    if (!tags.length && metrics.clickLoss > 0) {
      tags.push('mixed-decay');
    }
    return tags;
  }

  function pickPrimaryReason(reasonTags) {
    for (let index = 0; index < PRIMARY_REASON_PRIORITY.length; index += 1) {
      if (reasonTags.indexOf(PRIMARY_REASON_PRIORITY[index]) !== -1) {
        return PRIMARY_REASON_PRIORITY[index];
      }
    }
    return 'mixed-decay';
  }

  function analyzeParsedData(parsed) {
    if (!parsed || !parsed.ok) {
      return parsed;
    }
    if (!parsed.validRows) {
      return { ok: false, error: 'No valid rows were found in the CSV.' };
    }

    let minDate = parsed.rows[0].date;
    let maxDate = parsed.rows[0].date;
    parsed.rows.forEach(function (row) {
      if (row.date < minDate) minDate = row.date;
      if (row.date > maxDate) maxDate = row.date;
    });

    const recentEnd = maxDate;
    const recentStart = addDays(recentEnd, -27);
    const previousEnd = addDays(recentStart, -1);
    const previousStart = addDays(previousEnd, -27);

    if (minDate > previousStart) {
      return {
        ok: false,
        error: 'CSV must cover both 28-day windows. Earliest valid date is ' + formatDate(minDate) + ', but previous window starts at ' + formatDate(previousStart) + '.',
      };
    }

    const aggregateByUrl = new Map();
    let previousWindowRows = 0;
    let recentWindowRows = 0;

    parsed.rows.forEach(function (row) {
      const inPrevious = row.date >= previousStart && row.date <= previousEnd;
      const inRecent = row.date >= recentStart && row.date <= recentEnd;
      if (!inPrevious && !inRecent) {
        return;
      }

      const key = row.page;
      if (!aggregateByUrl.has(key)) {
        aggregateByUrl.set(key, {
          url: key,
          previous: createEmptyPeriodStats(),
          recent: createEmptyPeriodStats(),
        });
      }

      const bucket = aggregateByUrl.get(key);
      const period = inPrevious ? bucket.previous : bucket.recent;
      if (inPrevious) previousWindowRows += 1;
      if (inRecent) recentWindowRows += 1;
      period.present = true;
      period.clicks += row.clicks;
      period.impressions += row.impressions;
      period.weightedPositionSum += row.position * row.impressions;
    });

    if (!previousWindowRows || !recentWindowRows) {
      return {
        ok: false,
        error: 'CSV must contain valid rows in both the previous and recent 28-day windows.',
      };
    }

    const ranked = [];
    const exclusionCounts = {
      newPage: 0,
      noLoss: 0,
      lowSample: 0,
    };

    aggregateByUrl.forEach(function (entry) {
      const prev = finalizePeriod(entry.previous);
      const recent = finalizePeriod(entry.recent);
      const clickLoss = Math.max(prev.clicks - recent.clicks, 0);
      const eligibleBySample = prev.clicks >= 10 || prev.impressions >= 200;
      const existsInPrevious = prev.present;
      const rates = {
        clickLossRate: Math.max(prev.clicks - recent.clicks, 0) / Math.max(prev.clicks, 1),
        impressionLossRate: Math.max(prev.impressions - recent.impressions, 0) / Math.max(prev.impressions, 1),
        ctrLossRate: Math.max(prev.ctr - recent.ctr, 0) / Math.max(prev.ctr, 0.0001),
        positionWorseningRate: Math.min(Math.max(recent.position - prev.position, 0) / 5, 1),
        absoluteClickLossRate: Math.min(clickLoss / 50, 1),
      };

      if (!existsInPrevious) {
        exclusionCounts.newPage += 1;
        return;
      }
      if (clickLoss <= 0) {
        exclusionCounts.noLoss += 1;
        return;
      }
      if (!eligibleBySample) {
        exclusionCounts.lowSample += 1;
        return;
      }

      const rawScore =
        35 * rates.clickLossRate +
        25 * rates.absoluteClickLossRate +
        15 * rates.impressionLossRate +
        15 * rates.ctrLossRate +
        10 * rates.positionWorseningRate;
      const decayScore = Math.round(rawScore);
      const reasonTags = computeReasonTags({
        clickLoss: clickLoss,
        prevImpressions: prev.impressions,
        recentImpressions: recent.impressions,
        prevPosition: prev.position,
        recentPosition: recent.position,
      }, rates);
      const primaryReason = pickPrimaryReason(reasonTags);
      const refreshAction = REFRESH_ACTIONS[primaryReason] || REFRESH_ACTIONS['mixed-decay'];

      ranked.push({
        rank: 0,
        url: entry.url,
        decayScore: decayScore,
        clickLoss: roundTo(clickLoss, 6),
        prevClicks: roundTo(prev.clicks, 6),
        recentClicks: roundTo(recent.clicks, 6),
        prevImpressions: roundTo(prev.impressions, 6),
        recentImpressions: roundTo(recent.impressions, 6),
        prevCtr: roundTo(prev.ctr, 6),
        recentCtr: roundTo(recent.ctr, 6),
        prevPosition: roundTo(prev.position, 6),
        recentPosition: roundTo(recent.position, 6),
        primaryReason: primaryReason,
        reasonTags: reasonTags,
        refreshActionKey: refreshAction.key,
        refreshAction: refreshAction.label,
        _rates: rates,
      });
    });

    ranked.sort(function (left, right) {
      if (right.decayScore !== left.decayScore) return right.decayScore - left.decayScore;
      if (right.clickLoss !== left.clickLoss) return right.clickLoss - left.clickLoss;
      if (right.prevClicks !== left.prevClicks) return right.prevClicks - left.prevClicks;
      return left.url.localeCompare(right.url);
    });

    ranked.forEach(function (row, index) {
      row.rank = index + 1;
    });

    const summary = {
      parsedRows: parsed.parsedRows,
      validRows: parsed.validRows,
      uniqueUrls: aggregateByUrl.size,
      rankedUrls: ranked.length,
      excludedUrls: aggregateByUrl.size - ranked.length,
      invalidRows: parsed.invalidRows,
      exclusions: {
        newPage: exclusionCounts.newPage,
        noLoss: exclusionCounts.noLoss,
        lowSample: exclusionCounts.lowSample,
      },
      warnings: [PARTIAL_WARNING],
    };

    const exportRows = ranked.map(function (row) {
      return {
        rank: row.rank,
        url: row.url,
        decayScore: row.decayScore,
        clickLoss: row.clickLoss,
        prevClicks: row.prevClicks,
        recentClicks: row.recentClicks,
        prevImpressions: row.prevImpressions,
        recentImpressions: row.recentImpressions,
        prevCtr: row.prevCtr,
        recentCtr: row.recentCtr,
        prevPosition: row.prevPosition,
        recentPosition: row.recentPosition,
        primaryReason: row.primaryReason,
        reasonTags: row.reasonTags.slice(),
        refreshActionKey: row.refreshActionKey,
        refreshAction: row.refreshAction,
      };
    });

    return {
      ok: true,
      window: {
        previousStart: formatDate(previousStart),
        previousEnd: formatDate(previousEnd),
        recentStart: formatDate(recentStart),
        recentEnd: formatDate(recentEnd),
      },
      summary: summary,
      results: exportRows,
      parsed: parsed,
    };
  }

  function analyzeCsvText(csvText) {
    const parsed = parseCsvText(csvText);
    if (!parsed.ok) {
      return parsed;
    }
    return analyzeParsedData(parsed);
  }

  function serializeResultsToJson(analysis, options) {
    const payload = {
      generatedAt: options && options.generatedAt ? options.generatedAt : new Date().toISOString(),
      window: analysis.window,
      summary: analysis.summary,
      results: analysis.results,
    };
    return JSON.stringify(payload, null, 2);
  }

  function serializeResultsToCsv(analysis) {
    const columns = [
      'rank',
      'url',
      'decayScore',
      'clickLoss',
      'prevClicks',
      'recentClicks',
      'prevImpressions',
      'recentImpressions',
      'prevCtr',
      'recentCtr',
      'prevPosition',
      'recentPosition',
      'primaryReason',
      'reasonTags',
      'refreshActionKey',
      'refreshAction',
    ];
    const lines = [columns.join(',')];
    analysis.results.forEach(function (row) {
      lines.push(columns.map(function (column) {
        const value = column === 'reasonTags' ? row.reasonTags.join('|') : row[column];
        return escapeCsvCell(value);
      }).join(','));
    });
    return lines.join('\n');
  }

  function formatInteger(value) {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
  }

  function formatNumber(value) {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
  }

  function formatPercent(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  function describeSort(columnKey, direction) {
    const dirLabel = direction === 'desc' ? '↓' : '↑';
    return dirLabel + ' ' + columnKey;
  }

  function sortRows(rows, sortState) {
    const column = TABLE_COLUMNS.find(function (item) { return item.key === sortState.key; }) || TABLE_COLUMNS[0];
    const direction = sortState.direction === 'asc' ? 1 : -1;
    const copy = rows.slice();
    copy.sort(function (left, right) {
      let comparison = 0;
      if (column.type === 'number' || column.type === 'percent') {
        const leftValue = Number(left[column.key]);
        const rightValue = Number(right[column.key]);
        comparison = leftValue === rightValue ? 0 : (leftValue > rightValue ? 1 : -1);
      } else if (column.type === 'tags') {
        comparison = left.reasonTags.join(',').localeCompare(right.reasonTags.join(','));
      } else {
        comparison = String(left[column.key]).localeCompare(String(right[column.key]));
      }
      if (comparison === 0) {
        comparison = left.rank - right.rank;
      }
      return comparison * direction;
    });
    return copy;
  }

  function downloadText(filename, content, mimeType) {
    if (typeof document === 'undefined') return;
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 0);
  }

  function initBrowser() {
    const refs = {
      csvFileInput: document.getElementById('csvFileInput'),
      loadFixtureBtn: document.getElementById('loadFixtureBtn'),
      reanalyzeBtn: document.getElementById('reanalyzeBtn'),
      fileStatus: document.getElementById('fileStatus'),
      errorBox: document.getElementById('errorBox'),
      errorText: document.getElementById('errorText'),
      parsedRows: document.getElementById('parsedRows'),
      validRows: document.getElementById('validRows'),
      uniqueUrls: document.getElementById('uniqueUrls'),
      rankedUrls: document.getElementById('rankedUrls'),
      excludedUrls: document.getElementById('excludedUrls'),
      analysisWindow: document.getElementById('analysisWindow'),
      coverageList: document.getElementById('coverageList'),
      warningList: document.getElementById('warningList'),
      emptyState: document.getElementById('emptyState'),
      tableWrap: document.getElementById('tableWrap'),
      resultsHeadRow: document.getElementById('resultsHeadRow'),
      resultsBody: document.getElementById('resultsBody'),
      exportJsonBtn: document.getElementById('exportJsonBtn'),
      exportCsvBtn: document.getElementById('exportCsvBtn'),
    };

    if (!refs.csvFileInput || !refs.resultsBody) {
      return;
    }

    const state = {
      csvText: '',
      fileName: '',
      analysis: null,
      sort: { key: 'rank', direction: 'asc' },
    };

    function setError(message) {
      refs.errorBox.classList.toggle('hidden', !message);
      refs.errorText.textContent = message || '';
    }

    function setFileStatus(message) {
      refs.fileStatus.textContent = message;
    }

    function resetSummary() {
      refs.parsedRows.textContent = '0';
      refs.validRows.textContent = '0';
      refs.uniqueUrls.textContent = '0';
      refs.rankedUrls.textContent = '0';
      refs.excludedUrls.textContent = '0';
      refs.analysisWindow.textContent = '—';
      refs.coverageList.innerHTML = '<li>Upload a CSV to view exclusions and window coverage.</li>';
      refs.warningList.innerHTML = '<li>' + escapeHtml(PARTIAL_WARNING) + '</li>';
      refs.exportJsonBtn.disabled = true;
      refs.exportCsvBtn.disabled = true;
      refs.tableWrap.classList.add('hidden');
      refs.emptyState.classList.remove('hidden');
      refs.resultsBody.innerHTML = '';
      refs.resultsHeadRow.innerHTML = '';
    }

    function renderWarnings(summary) {
      refs.warningList.innerHTML = summary.warnings.map(function (warning) {
        return '<li>' + escapeHtml(warning) + '</li>';
      }).join('');
    }

    function renderSummary(analysis) {
      refs.parsedRows.textContent = formatInteger(analysis.summary.parsedRows);
      refs.validRows.textContent = formatInteger(analysis.summary.validRows);
      refs.uniqueUrls.textContent = formatInteger(analysis.summary.uniqueUrls);
      refs.rankedUrls.textContent = formatInteger(analysis.summary.rankedUrls);
      refs.excludedUrls.textContent = formatInteger(analysis.summary.excludedUrls);
      refs.analysisWindow.textContent = analysis.window.previousStart + ' → ' + analysis.window.recentEnd;
      refs.coverageList.innerHTML = [
        'Previous window: ' + analysis.window.previousStart + ' → ' + analysis.window.previousEnd,
        'Recent window: ' + analysis.window.recentStart + ' → ' + analysis.window.recentEnd,
        'Excluded new pages: ' + analysis.summary.exclusions.newPage,
        'Excluded no-loss pages: ' + analysis.summary.exclusions.noLoss,
        'Excluded low-sample pages: ' + analysis.summary.exclusions.lowSample,
        'Invalid rows excluded: ' + analysis.summary.invalidRows,
      ].map(function (line) {
        return '<li>' + escapeHtml(line) + '</li>';
      }).join('');
      renderWarnings(analysis.summary);
    }

    function renderTable() {
      if (!state.analysis || !state.analysis.results.length) {
        refs.tableWrap.classList.add('hidden');
        refs.emptyState.classList.remove('hidden');
        refs.resultsBody.innerHTML = '';
        refs.resultsHeadRow.innerHTML = '';
        return;
      }

      const sortedRows = sortRows(state.analysis.results, state.sort);
      refs.resultsHeadRow.innerHTML = TABLE_COLUMNS.map(function (column) {
        const active = state.sort.key === column.key;
        const label = active ? column.label + ' ' + describeSort('', state.sort.direction).trim() : column.label;
        return '<th><button type="button" data-sort-key="' + escapeHtml(column.key) + '">' + escapeHtml(label) + '</button></th>';
      }).join('');

      refs.resultsBody.innerHTML = sortedRows.map(function (row) {
        return '<tr>' + TABLE_COLUMNS.map(function (column) {
          return renderCell(column, row);
        }).join('') + '</tr>';
      }).join('');

      refs.tableWrap.classList.remove('hidden');
      refs.emptyState.classList.add('hidden');
    }

    function renderCell(column, row) {
      if (column.key === 'rank') {
        return '<td><span class="rank-pill">#' + row.rank + '</span></td>';
      }
      if (column.key === 'url') {
        return '<td class="mono"><a href="' + escapeHtml(row.url) + '" target="_blank" rel="noreferrer noopener">' + escapeHtml(row.url) + '</a></td>';
      }
      if (column.key === 'reasonTags') {
        return '<td>' + row.reasonTags.map(function (tag) {
          const tone = tag === 'possible-deindex' ? 'bad' : tag === 'demand-down' ? 'warn' : 'good';
          return '<span class="tag-pill tag-pill--' + tone + '">' + escapeHtml(tag) + '</span>';
        }).join('') + '</td>';
      }
      if (column.key === 'refreshAction') {
        return '<td><span class="action-pill">' + escapeHtml(row.refreshActionKey) + '</span><div style="margin-top: 8px; color: var(--muted); line-height: 1.55;">' + escapeHtml(row.refreshAction) + '</div></td>';
      }
      if (column.type === 'percent') {
        return '<td class="num">' + escapeHtml(formatPercent(row[column.key])) + '</td>';
      }
      if (column.type === 'number') {
        return '<td class="num">' + escapeHtml(formatNumber(row[column.key])) + '</td>';
      }
      return '<td>' + escapeHtml(String(row[column.key])) + '</td>';
    }

    function renderAnalysis() {
      if (!state.analysis || !state.analysis.ok) {
        resetSummary();
        if (state.analysis && state.analysis.error) {
          setError(state.analysis.error);
        }
        return;
      }
      setError('');
      renderSummary(state.analysis);
      renderTable();
      refs.exportJsonBtn.disabled = false;
      refs.exportCsvBtn.disabled = false;
    }

    function runAnalysis() {
      if (!state.csvText.trim()) {
        setError('Upload a CSV or load the fixture before running analysis.');
        resetSummary();
        return;
      }
      state.analysis = analyzeCsvText(state.csvText);
      renderAnalysis();
    }

    function ingestText(csvText, label) {
      state.csvText = csvText;
      state.fileName = label;
      setFileStatus('Loaded: ' + label);
      runAnalysis();
    }

    refs.csvFileInput.addEventListener('change', function (event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (loadEvent) {
        ingestText(String(loadEvent.target.result || ''), file.name);
      };
      reader.onerror = function () {
        setError('Failed to read the selected file. Try exporting the CSV again.');
      };
      reader.readAsText(file);
    });

    refs.loadFixtureBtn.addEventListener('click', function () {
      fetch('./fixtures/sample-gsc-page-export.csv')
        .then(function (response) {
          if (!response.ok) {
            throw new Error('Fixture request failed with status ' + response.status + '.');
          }
          return response.text();
        })
        .then(function (text) {
          ingestText(text, 'sample-gsc-page-export.csv');
        })
        .catch(function (error) {
          setError('Could not load the sample fixture. ' + error.message);
        });
    });

    refs.reanalyzeBtn.addEventListener('click', function () {
      runAnalysis();
    });

    refs.exportJsonBtn.addEventListener('click', function () {
      if (!state.analysis || !state.analysis.ok) return;
      downloadText('search-console-decay-radar-export.json', serializeResultsToJson(state.analysis), 'application/json');
    });

    refs.exportCsvBtn.addEventListener('click', function () {
      if (!state.analysis || !state.analysis.ok) return;
      downloadText('search-console-decay-radar-export.csv', serializeResultsToCsv(state.analysis), 'text/csv;charset=utf-8');
    });

    refs.resultsHeadRow.addEventListener('click', function (event) {
      const button = event.target.closest('button[data-sort-key]');
      if (!button) return;
      const key = button.getAttribute('data-sort-key');
      if (state.sort.key === key) {
        state.sort.direction = state.sort.direction === 'asc' ? 'desc' : 'asc';
      } else {
        state.sort.key = key;
        state.sort.direction = key === 'url' || key === 'primaryReason' || key === 'reasonTags' || key === 'refreshAction' ? 'asc' : 'desc';
      }
      renderTable();
    });

    resetSummary();
  }

  return {
    PARTIAL_WARNING: PARTIAL_WARNING,
    HEADER_ALIASES: HEADER_ALIASES,
    REFRESH_ACTIONS: REFRESH_ACTIONS,
    parseCsv: parseCsv,
    parseCsvText: parseCsvText,
    analyzeParsedData: analyzeParsedData,
    analyzeCsvText: analyzeCsvText,
    serializeResultsToJson: serializeResultsToJson,
    serializeResultsToCsv: serializeResultsToCsv,
    initBrowser: initBrowser,
  };
});
