(function (global, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.KeywordCannibalizationChecker = api;
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    window.addEventListener('DOMContentLoaded', function () {
      api.initBrowser();
    });
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const REQUIRED_KEYS = ['query', 'page', 'clicks', 'impressions', 'position'];
  const DEFAULT_CONTROLS = {
    minQueryImpressions: 50,
    minDistinctPages: 2,
    brandTerms: '',
    maxRowsShown: 100,
    sortMode: 'severity',
  };
  const SORT_MODES = new Set(['severity', 'affectedImpressions']);
  const HEADER_ALIASES = {
    query: ['query', 'Query', 'Queries', 'Top queries', 'Search query', '검색어'],
    page: ['page', 'Page', 'Pages', 'Top pages', 'Landing page', 'Page URL', 'URL', '페이지'],
    clicks: ['clicks', 'Clicks', '클릭수'],
    impressions: ['impressions', 'Impressions', '노출수'],
    ctr: ['ctr', 'CTR', 'Average CTR', '평균 CTR'],
    position: ['position', 'Position', 'Average position', '평균 게재순위'],
    country: ['country', 'Country', '국가'],
    device: ['device', 'Device', '기기'],
    date: ['date', 'Date', '날짜'],
  };
  const TABLE_COLUMNS = [
    { key: 'query', label: 'Query', type: 'string' },
    { key: 'severityScore', label: 'Severity', type: 'number' },
    { key: 'severityBand', label: 'Band', type: 'string' },
    { key: 'distinctPages', label: 'Pages', type: 'number' },
    { key: 'totalImpressions', label: 'Impressions', type: 'number' },
    { key: 'affectedImpressions', label: 'Affected impressions', type: 'number' },
    { key: 'totalClicks', label: 'Clicks', type: 'number' },
    { key: 'topPageShare', label: 'Top page share', type: 'percent' },
    { key: 'recommendedAction', label: 'Recommended action', type: 'string' },
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

  function parseNumberCell(value) {
    const text = String(value || '').trim();
    if (!text) return null;
    const cleaned = text.replace(/,/g, '').replace(/%/g, '').trim();
    if (!cleaned) return null;
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : null;
  }

  function parsePercentCell(value) {
    const text = String(value || '').trim();
    if (!text) return null;
    const numeric = parseNumberCell(text);
    if (numeric == null) return null;
    if (/%$/.test(text) || numeric > 1) {
      return roundTo(numeric / 100, 6);
    }
    return roundTo(numeric, 6);
  }

  function normalizeQuery(value) {
    return String(value || '')
      .normalize('NFKC')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  }

  function normalizePage(value) {
    return String(value || '').trim();
  }

  function uniq(values) {
    return Array.from(new Set(values));
  }

  function parseBrandTerms(value) {
    return uniq(
      String(value || '')
        .split(/[\n,]/)
        .map(normalizeQuery)
        .filter(Boolean)
    );
  }

  function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function queryContainsBrand(query, brandTerms) {
    const normalized = normalizeQuery(query);
    if (!normalized || !brandTerms.length) return false;
    return brandTerms.some(function (term) {
      if (!term) return false;
      const source = escapeRegex(term).replace(/\s+/g, '\\s+');
      const pattern = new RegExp('(?:^|\\s)' + source + '(?:$|\\s)');
      return pattern.test(normalized);
    });
  }

  function normalizeControls(controls) {
    const merged = Object.assign({}, DEFAULT_CONTROLS, controls || {});
    const minQueryImpressions = Number.isFinite(Number(merged.minQueryImpressions))
      ? Math.max(0, Math.round(Number(merged.minQueryImpressions)))
      : DEFAULT_CONTROLS.minQueryImpressions;
    const minDistinctPages = Number.isFinite(Number(merged.minDistinctPages))
      ? Math.max(2, Math.round(Number(merged.minDistinctPages)))
      : DEFAULT_CONTROLS.minDistinctPages;
    const maxRowsShown = Number.isFinite(Number(merged.maxRowsShown))
      ? Math.max(1, Math.round(Number(merged.maxRowsShown)))
      : DEFAULT_CONTROLS.maxRowsShown;
    const sortMode = SORT_MODES.has(String(merged.sortMode || ''))
      ? String(merged.sortMode)
      : DEFAULT_CONTROLS.sortMode;

    return {
      minQueryImpressions: minQueryImpressions,
      minDistinctPages: minDistinctPages,
      brandTerms: String(merged.brandTerms || ''),
      maxRowsShown: maxRowsShown,
      sortMode: sortMode,
    };
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

  function toDisplayPercent(value) {
    return value == null ? '—' : formatPercent(value);
  }

  function toDisplayNumber(value) {
    return value == null ? '—' : formatNumber(value);
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

    const dataRows = matrix.slice(1).filter(function (cells) {
      return cells.some(function (cell) { return String(cell).trim() !== ''; });
    });

    const rows = [];
    let invalidRows = 0;

    dataRows.forEach(function (cells, dataIndex) {
      function getValue(key) {
        const cellIndex = logicalColumns[key];
        return cellIndex == null ? '' : String(cells[cellIndex] || '').trim();
      }

      const query = normalizeQuery(getValue('query'));
      const page = normalizePage(getValue('page'));
      const clicks = parseNumberCell(getValue('clicks'));
      const impressions = parseNumberCell(getValue('impressions'));
      const position = parseNumberCell(getValue('position'));
      const ctr = logicalColumns.ctr == null ? null : parsePercentCell(getValue('ctr'));
      const country = getValue('country');
      const device = getValue('device');
      const date = getValue('date');

      const invalid = (
        !query ||
        !page ||
        clicks == null ||
        impressions == null ||
        position == null ||
        impressions <= 0
      );

      if (invalid) {
        invalidRows += 1;
        return;
      }

      rows.push({
        rowNumber: dataIndex + 2,
        query: query,
        page: page,
        clicks: roundTo(clicks, 6),
        impressions: roundTo(impressions, 6),
        ctr: ctr,
        position: roundTo(position, 6),
        country: country,
        device: device,
        date: date,
      });
    });

    return {
      ok: true,
      headers: headers,
      logicalColumns: logicalColumns,
      parsedRows: dataRows.length,
      validRows: rows.length,
      invalidRows: invalidRows,
      rows: rows,
    };
  }

  function comparePageRows(left, right) {
    if (right.impressions !== left.impressions) return right.impressions - left.impressions;
    if (right.clicks !== left.clicks) return right.clicks - left.clicks;
    if (left.position !== right.position) return left.position - right.position;
    return left.page.localeCompare(right.page);
  }

  function classifySeverityBand(score) {
    if (score >= 70) return 'high';
    if (score >= 45) return 'medium';
    return 'low';
  }

  function pickRecommendation(distinctPages, topPageShare, positionSpread) {
    if (distinctPages >= 3 && topPageShare < 0.6) {
      return 'merge-or-canonicalize';
    }
    if (topPageShare >= 0.6 && topPageShare <= 0.85 && positionSpread >= 5) {
      return 'strengthen-primary-page';
    }
    return 'split-intent-and-retitle';
  }

  function recommendationCopy(recommendedAction) {
    if (recommendedAction === 'merge-or-canonicalize') {
      return 'Three or more URLs are splitting the same query and no single page owns enough of the demand. Consolidate overlapping assets, tighten canonical signals, or merge duplicate sections before adding more links.';
    }
    if (recommendedAction === 'strengthen-primary-page') {
      return 'A leading page exists, but meaningful demand is still leaking to alternates. Strengthen the primary page with clearer title targeting, internal links, and supporting sections while de-emphasizing weaker competitors.';
    }
    return 'Overlap exists, but a hard merge is not obviously correct. Clarify search intent, retitle competing URLs, sharpen internal anchor text, and make page roles more explicit before consolidating.';
  }

  function buildSeverityExplanation(cluster) {
    return (
      cluster.severityBand.toUpperCase() + ' severity: ' +
      formatInteger(cluster.totalImpressions) + ' impressions are split across ' +
      formatInteger(cluster.distinctPages) + ' pages. The leading page owns ' +
      formatPercent(cluster.topPageShare) + ' of impressions, leaving ' +
      formatInteger(cluster.affectedImpressions) + ' impressions and ' +
      formatInteger(cluster.affectedClicks) + ' clicks exposed on competing URLs. '
    ) + (
      'Score components → impressions ' + formatNumber(cluster.scoreBreakdown.impressionComponent) +
      ', split ' + formatNumber(cluster.scoreBreakdown.splitComponent) +
      ', page count ' + formatNumber(cluster.scoreBreakdown.pageComponent) +
      ', position spread ' + formatNumber(cluster.scoreBreakdown.spreadComponent) + '.'
    );
  }

  function scoreQueryCluster(query, rows) {
    const rankedRows = rows.slice().sort(comparePageRows);
    const topPage = rankedRows[0];
    const distinctPages = uniq(rankedRows.map(function (row) { return row.page; })).length;
    const totalImpressions = roundTo(rankedRows.reduce(function (sum, row) { return sum + row.impressions; }, 0), 6);
    const totalClicks = roundTo(rankedRows.reduce(function (sum, row) { return sum + row.clicks; }, 0), 6);
    const topPageShare = totalImpressions > 0 ? topPage.impressions / totalImpressions : 0;
    const affectedImpressions = roundTo(totalImpressions - topPage.impressions, 6);
    const affectedClicks = roundTo(totalClicks - topPage.clicks, 6);
    const positions = rankedRows.map(function (row) { return row.position; });
    const positionSpread = roundTo(Math.max.apply(null, positions) - Math.min.apply(null, positions), 6);
    const scoreBreakdown = {
      impressionComponent: roundTo(Math.min(40, totalImpressions / 25), 6),
      splitComponent: roundTo((1 - topPageShare) * 35, 6),
      pageComponent: roundTo(Math.min(15, (distinctPages - 1) * 5), 6),
      spreadComponent: roundTo(Math.min(10, positionSpread), 6),
    };
    const severityScore = Math.round(
      scoreBreakdown.impressionComponent +
      scoreBreakdown.splitComponent +
      scoreBreakdown.pageComponent +
      scoreBreakdown.spreadComponent
    );
    const severityBand = classifySeverityBand(severityScore);
    const recommendedAction = pickRecommendation(distinctPages, topPageShare, positionSpread);

    return {
      query: query,
      severityScore: severityScore,
      severityBand: severityBand,
      recommendedAction: recommendedAction,
      distinctPages: distinctPages,
      totalImpressions: totalImpressions,
      affectedImpressions: affectedImpressions,
      totalClicks: totalClicks,
      affectedClicks: affectedClicks,
      topPage: {
        page: topPage.page,
        impressions: topPage.impressions,
        clicks: topPage.clicks,
        ctr: topPage.ctr,
        position: topPage.position,
      },
      topPageShare: roundTo(topPageShare, 6),
      positionSpread: positionSpread,
      scoreBreakdown: scoreBreakdown,
      rows: rankedRows.map(function (row, index) {
        return {
          page: row.page,
          impressions: row.impressions,
          clicks: row.clicks,
          ctr: row.ctr,
          position: row.position,
          country: row.country,
          device: row.device,
          date: row.date,
          pageShare: totalImpressions > 0 ? roundTo(row.impressions / totalImpressions, 6) : 0,
          isTopPage: index === 0,
        };
      }),
      severityExplanation: '',
      recommendationCopy: '',
    };
  }

  function compareClusters(left, right, sortMode) {
    if (sortMode === 'affectedImpressions') {
      if (right.affectedImpressions !== left.affectedImpressions) return right.affectedImpressions - left.affectedImpressions;
      if (right.severityScore !== left.severityScore) return right.severityScore - left.severityScore;
      return left.query.localeCompare(right.query);
    }
    if (right.severityScore !== left.severityScore) return right.severityScore - left.severityScore;
    if (right.affectedImpressions !== left.affectedImpressions) return right.affectedImpressions - left.affectedImpressions;
    return left.query.localeCompare(right.query);
  }

  function analyzeParsedData(parsed, controls) {
    if (!parsed || !parsed.ok) {
      return parsed;
    }

    const normalizedControls = normalizeControls(controls);
    const brandTerms = parseBrandTerms(normalizedControls.brandTerms);
    const groups = new Map();

    parsed.rows.forEach(function (row) {
      if (!groups.has(row.query)) {
        groups.set(row.query, []);
      }
      groups.get(row.query).push(row);
    });

    const results = [];
    const excluded = [];
    const summary = {
      parsedRows: parsed.parsedRows,
      validRows: parsed.validRows,
      invalidRows: parsed.invalidRows,
      eligibleQueries: 0,
      highSeverity: 0,
      mediumSeverity: 0,
      lowSeverity: 0,
      affectedImpressions: 0,
      affectedClicks: 0,
      excludedBrandQueries: 0,
      excludedBelowImpressions: 0,
      excludedBelowDistinctPages: 0,
    };

    groups.forEach(function (rows, query) {
      const cluster = scoreQueryCluster(query, rows);
      const exclusionReasons = [];

      if (queryContainsBrand(query, brandTerms)) {
        exclusionReasons.push('brand');
      }
      if (cluster.distinctPages < normalizedControls.minDistinctPages) {
        exclusionReasons.push('distinctPages');
      }
      if (cluster.totalImpressions < normalizedControls.minQueryImpressions) {
        exclusionReasons.push('impressions');
      }

      cluster.severityExplanation = buildSeverityExplanation(cluster);
      cluster.recommendationCopy = recommendationCopy(cluster.recommendedAction);

      if (exclusionReasons.length) {
        if (exclusionReasons.indexOf('brand') !== -1) summary.excludedBrandQueries += 1;
        if (exclusionReasons.indexOf('impressions') !== -1) summary.excludedBelowImpressions += 1;
        if (exclusionReasons.indexOf('distinctPages') !== -1) summary.excludedBelowDistinctPages += 1;
        excluded.push({
          query: query,
          exclusionReasons: exclusionReasons,
          distinctPages: cluster.distinctPages,
          totalImpressions: cluster.totalImpressions,
        });
        return;
      }

      summary.eligibleQueries += 1;
      summary.affectedImpressions += cluster.affectedImpressions;
      summary.affectedClicks += cluster.affectedClicks;
      if (cluster.severityBand === 'high') summary.highSeverity += 1;
      if (cluster.severityBand === 'medium') summary.mediumSeverity += 1;
      if (cluster.severityBand === 'low') summary.lowSeverity += 1;
      results.push(cluster);
    });

    results.sort(function (left, right) {
      return compareClusters(left, right, normalizedControls.sortMode);
    });

    results.forEach(function (row, index) {
      row.rank = index + 1;
    });

    summary.affectedImpressions = roundTo(summary.affectedImpressions, 6);
    summary.affectedClicks = roundTo(summary.affectedClicks, 6);

    return {
      ok: true,
      controls: normalizedControls,
      summary: summary,
      results: results,
      excluded: excluded,
      parsed: parsed,
    };
  }

  function analyzeCsvText(csvText, controls) {
    const parsed = parseCsvText(csvText);
    if (!parsed.ok) {
      return parsed;
    }
    return analyzeParsedData(parsed, controls);
  }

  function buildExportPayload(analysis, options) {
    return {
      generatedAt: options && options.generatedAt ? options.generatedAt : new Date().toISOString(),
      controls: Object.assign({}, analysis.controls),
      summary: Object.assign({}, analysis.summary),
      results: analysis.results.map(function (row) {
        return {
          query: row.query,
          severityScore: row.severityScore,
          severityBand: row.severityBand,
          recommendedAction: row.recommendedAction,
          distinctPages: row.distinctPages,
          totalImpressions: row.totalImpressions,
          affectedImpressions: row.affectedImpressions,
          totalClicks: row.totalClicks,
          affectedClicks: row.affectedClicks,
          topPageShare: row.topPageShare,
          topPage: Object.assign({}, row.topPage),
          positionSpread: row.positionSpread,
          scoreBreakdown: Object.assign({}, row.scoreBreakdown),
          rows: row.rows.map(function (pageRow) {
            return Object.assign({}, pageRow);
          }),
        };
      }),
    };
  }

  function serializeResultsToJson(analysis, options) {
    return JSON.stringify(buildExportPayload(analysis, options), null, 2);
  }

  function serializeResultsToCsv(analysis) {
    const headers = [
      'query',
      'severityScore',
      'severityBand',
      'recommendedAction',
      'distinctPages',
      'totalImpressions',
      'affectedImpressions',
      'totalClicks',
      'topPageShare',
    ];
    const lines = [headers.join(',')];
    analysis.results.forEach(function (row) {
      lines.push(headers.map(function (key) {
        return escapeCsvCell(row[key]);
      }).join(','));
    });
    return lines.join('\n');
  }

  function buildCopySummary(analysis) {
    const lines = [
      'Keyword Cannibalization Checker summary',
      'Eligible queries: ' + formatInteger(analysis.summary.eligibleQueries),
      'High / Medium / Low: ' + [analysis.summary.highSeverity, analysis.summary.mediumSeverity, analysis.summary.lowSeverity].map(formatInteger).join(' / '),
      'Affected impressions: ' + formatInteger(analysis.summary.affectedImpressions),
      'Affected clicks: ' + formatInteger(analysis.summary.affectedClicks),
      '',
      'Top overlaps:',
    ];

    analysis.results.slice(0, 5).forEach(function (row, index) {
      lines.push(
        (index + 1) + '. ' + row.query +
        ' — severity ' + row.severityScore +
        ' (' + row.severityBand + '), ' +
        formatInteger(row.affectedImpressions) + ' affected impressions, action: ' + row.recommendedAction
      );
    });

    if (!analysis.results.length) {
      lines.push('No eligible cannibalization clusters under the current filters.');
    }

    return lines.join('\n');
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

  function copyText(text) {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return Promise.reject(new Error('Clipboard API unavailable.'));
  }

  function renderList(values, formatter, emptyLabel) {
    if (!values.length) {
      return '<li>' + escapeHtml(emptyLabel) + '</li>';
    }
    return values.map(function (value) {
      return '<li>' + formatter(value) + '</li>';
    }).join('');
  }

  function initBrowser() {
    if (typeof document === 'undefined') {
      return;
    }

    const refs = {
      csvFileInput: document.getElementById('csvFileInput'),
      loadFixtureBtn: document.getElementById('loadFixtureBtn'),
      fileStatus: document.getElementById('fileStatus'),
      errorBox: document.getElementById('errorBox'),
      errorText: document.getElementById('errorText'),
      minQueryImpressions: document.getElementById('minQueryImpressions'),
      minDistinctPages: document.getElementById('minDistinctPages'),
      brandTerms: document.getElementById('brandTerms'),
      maxRowsShown: document.getElementById('maxRowsShown'),
      sortMode: document.getElementById('sortMode'),
      summaryEligible: document.getElementById('summaryEligible'),
      summaryHigh: document.getElementById('summaryHigh'),
      summaryMedium: document.getElementById('summaryMedium'),
      summaryLow: document.getElementById('summaryLow'),
      summaryAffectedImpressions: document.getElementById('summaryAffectedImpressions'),
      summaryAffectedClicks: document.getElementById('summaryAffectedClicks'),
      summaryParsedRows: document.getElementById('summaryParsedRows'),
      summaryInvalidRows: document.getElementById('summaryInvalidRows'),
      summaryExcludedBrand: document.getElementById('summaryExcludedBrand'),
      summaryExcludedImpressions: document.getElementById('summaryExcludedImpressions'),
      summaryExcludedDistinct: document.getElementById('summaryExcludedDistinct'),
      resultsCount: document.getElementById('resultsCount'),
      emptyState: document.getElementById('emptyState'),
      tableWrap: document.getElementById('tableWrap'),
      resultsBody: document.getElementById('resultsBody'),
      exportJsonBtn: document.getElementById('exportJsonBtn'),
      exportCsvBtn: document.getElementById('exportCsvBtn'),
      copySummaryBtn: document.getElementById('copySummaryBtn'),
      summaryText: document.getElementById('summaryText'),
      detailPanel: document.getElementById('detailPanel'),
      detailTitle: document.getElementById('detailTitle'),
      detailMeta: document.getElementById('detailMeta'),
      detailRows: document.getElementById('detailRows'),
      detailSeverity: document.getElementById('detailSeverity'),
      detailRecommendation: document.getElementById('detailRecommendation'),
    };

    if (!refs.csvFileInput || !refs.resultsBody) {
      return;
    }

    const state = {
      csvText: '',
      fileName: '',
      analysis: null,
      selectedQuery: null,
    };

    function currentControls() {
      return normalizeControls({
        minQueryImpressions: refs.minQueryImpressions.value,
        minDistinctPages: refs.minDistinctPages.value,
        brandTerms: refs.brandTerms.value,
        maxRowsShown: refs.maxRowsShown.value,
        sortMode: refs.sortMode.value,
      });
    }

    function setError(message) {
      refs.errorBox.classList.toggle('hidden', !message);
      refs.errorText.textContent = message || '';
    }

    function setFileStatus(message) {
      refs.fileStatus.textContent = message;
    }

    function setSummary(summary) {
      refs.summaryEligible.textContent = formatInteger(summary.eligibleQueries);
      refs.summaryHigh.textContent = formatInteger(summary.highSeverity);
      refs.summaryMedium.textContent = formatInteger(summary.mediumSeverity);
      refs.summaryLow.textContent = formatInteger(summary.lowSeverity);
      refs.summaryAffectedImpressions.textContent = formatInteger(summary.affectedImpressions);
      refs.summaryAffectedClicks.textContent = formatInteger(summary.affectedClicks);
      refs.summaryParsedRows.textContent = formatInteger(summary.parsedRows);
      refs.summaryInvalidRows.textContent = formatInteger(summary.invalidRows);
      refs.summaryExcludedBrand.textContent = formatInteger(summary.excludedBrandQueries);
      refs.summaryExcludedImpressions.textContent = formatInteger(summary.excludedBelowImpressions);
      refs.summaryExcludedDistinct.textContent = formatInteger(summary.excludedBelowDistinctPages);
    }

    function resetSummary() {
      setSummary({
        eligibleQueries: 0,
        highSeverity: 0,
        mediumSeverity: 0,
        lowSeverity: 0,
        affectedImpressions: 0,
        affectedClicks: 0,
        parsedRows: 0,
        invalidRows: 0,
        excludedBrandQueries: 0,
        excludedBelowImpressions: 0,
        excludedBelowDistinctPages: 0,
      });
      refs.resultsCount.textContent = 'No analysis yet.';
      refs.resultsBody.innerHTML = '';
      refs.emptyState.classList.remove('hidden');
      refs.tableWrap.classList.add('hidden');
      refs.exportJsonBtn.disabled = true;
      refs.exportCsvBtn.disabled = true;
      refs.copySummaryBtn.disabled = true;
      refs.summaryText.value = '';
      refs.detailPanel.classList.add('hidden');
      refs.detailTitle.textContent = 'No query selected yet';
      refs.detailMeta.textContent = 'Upload a GSC page+query CSV or load the sample fixture to inspect overlap details.';
      refs.detailRows.innerHTML = '<li>No page rows yet.</li>';
      refs.detailSeverity.textContent = '—';
      refs.detailRecommendation.textContent = '—';
      state.selectedQuery = null;
    }

    function renderDetail(query) {
      if (!state.analysis || !state.analysis.ok) {
        refs.detailPanel.classList.add('hidden');
        return;
      }
      const match = state.analysis.results.find(function (row) {
        return row.query === query;
      });
      if (!match) {
        refs.detailPanel.classList.add('hidden');
        return;
      }

      state.selectedQuery = match.query;
      refs.detailPanel.classList.remove('hidden');
      refs.detailTitle.textContent = match.query;
      refs.detailMeta.textContent = [
        'severity ' + match.severityScore + ' (' + match.severityBand + ')',
        formatInteger(match.distinctPages) + ' pages',
        formatInteger(match.affectedImpressions) + ' affected impressions',
      ].join(' · ');
      refs.detailRows.innerHTML = renderList(match.rows, function (row) {
        const parts = [
          '<strong>' + escapeHtml(row.page) + '</strong>' + (row.isTopPage ? ' <span class="pill">top page</span>' : ''),
          '<div class="detail-sub">' +
            'impressions ' + escapeHtml(formatInteger(row.impressions)) + ' · ' +
            'clicks ' + escapeHtml(formatInteger(row.clicks)) + ' · ' +
            'CTR ' + escapeHtml(toDisplayPercent(row.ctr)) + ' · ' +
            'position ' + escapeHtml(toDisplayNumber(row.position)) + ' · ' +
            'share ' + escapeHtml(formatPercent(row.pageShare)) +
          '</div>',
        ];
        return parts.join('');
      }, 'No page rows found.');
      refs.detailSeverity.textContent = match.severityExplanation;
      refs.detailRecommendation.textContent = match.recommendationCopy;

      Array.from(refs.resultsBody.querySelectorAll('button[data-query]')).forEach(function (button) {
        const isActive = button.getAttribute('data-query') === match.query;
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    }

    function renderTable() {
      if (!state.analysis || !state.analysis.ok || !state.analysis.results.length) {
        refs.resultsBody.innerHTML = '';
        refs.emptyState.classList.remove('hidden');
        refs.tableWrap.classList.add('hidden');
        refs.resultsCount.textContent = 'No eligible cannibalization clusters under the current filters.';
        refs.detailPanel.classList.add('hidden');
        return;
      }

      const visibleRows = state.analysis.results.slice(0, state.analysis.controls.maxRowsShown);
      refs.resultsBody.innerHTML = visibleRows.map(function (row) {
        return '<tr>' +
          '<td class="mono"><button class="row-select" type="button" data-query="' + escapeHtml(row.query) + '" aria-pressed="false">' + escapeHtml(row.query) + '</button></td>' +
          TABLE_COLUMNS.slice(1).map(function (column) {
            if (column.type === 'number') {
              return '<td class="num">' + escapeHtml(formatNumber(row[column.key])) + '</td>';
            }
            if (column.type === 'percent') {
              return '<td class="num">' + escapeHtml(formatPercent(row[column.key])) + '</td>';
            }
            return '<td>' + escapeHtml(String(row[column.key])) + '</td>';
          }).join('') +
          '</tr>';
      }).join('');
      refs.resultsCount.textContent = 'Showing ' + formatInteger(visibleRows.length) + ' of ' + formatInteger(state.analysis.results.length) + ' eligible queries.';
      refs.emptyState.classList.add('hidden');
      refs.tableWrap.classList.remove('hidden');
      renderDetail(state.selectedQuery || visibleRows[0].query);
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
      setSummary(state.analysis.summary);
      refs.exportJsonBtn.disabled = false;
      refs.exportCsvBtn.disabled = false;
      refs.copySummaryBtn.disabled = false;
      refs.summaryText.value = buildCopySummary(state.analysis);
      renderTable();
    }

    function runAnalysis() {
      if (!state.csvText.trim()) {
        resetSummary();
        return;
      }
      state.analysis = analyzeCsvText(state.csvText, currentControls());
      renderAnalysis();
    }

    function ingestText(csvText, label) {
      state.csvText = String(csvText || '');
      state.fileName = label;
      setFileStatus('Loaded: ' + label + ' · processed locally in your browser.');
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
        setError('Could not read the selected CSV file.');
      };
      reader.readAsText(file);
    });

    refs.loadFixtureBtn.addEventListener('click', function () {
      fetch('./fixtures/sample-gsc-query-page-export.csv')
        .then(function (response) {
          if (!response.ok) {
            throw new Error('Fixture request failed with status ' + response.status + '.');
          }
          return response.text();
        })
        .then(function (text) {
          ingestText(text, 'sample-gsc-query-page-export.csv');
        })
        .catch(function (error) {
          setError('Could not load the sample fixture. ' + error.message);
        });
    });

    [
      refs.minQueryImpressions,
      refs.minDistinctPages,
      refs.brandTerms,
      refs.maxRowsShown,
      refs.sortMode,
    ].forEach(function (element) {
      element.addEventListener('input', runAnalysis);
      element.addEventListener('change', runAnalysis);
    });

    refs.exportJsonBtn.addEventListener('click', function () {
      if (!state.analysis || !state.analysis.ok) return;
      downloadText('keyword-cannibalization-checker-export.json', serializeResultsToJson(state.analysis), 'application/json');
    });

    refs.exportCsvBtn.addEventListener('click', function () {
      if (!state.analysis || !state.analysis.ok) return;
      downloadText('keyword-cannibalization-checker-export.csv', serializeResultsToCsv(state.analysis), 'text/csv;charset=utf-8');
    });

    refs.copySummaryBtn.addEventListener('click', function () {
      if (!state.analysis || !state.analysis.ok) return;
      copyText(refs.summaryText.value)
        .then(function () {
          refs.copySummaryBtn.textContent = 'Copied';
          setTimeout(function () {
            refs.copySummaryBtn.textContent = 'Copy summary';
          }, 1200);
        })
        .catch(function () {
          setError('Clipboard permission was unavailable. You can still copy the summary text manually below.');
        });
    });

    refs.resultsBody.addEventListener('click', function (event) {
      const button = event.target.closest('button[data-query]');
      if (!button) return;
      renderDetail(button.getAttribute('data-query'));
    });

    refs.minQueryImpressions.value = String(DEFAULT_CONTROLS.minQueryImpressions);
    refs.minDistinctPages.value = String(DEFAULT_CONTROLS.minDistinctPages);
    refs.brandTerms.value = DEFAULT_CONTROLS.brandTerms;
    refs.maxRowsShown.value = String(DEFAULT_CONTROLS.maxRowsShown);
    refs.sortMode.value = DEFAULT_CONTROLS.sortMode;
    resetSummary();
  }

  return {
    REQUIRED_KEYS: REQUIRED_KEYS,
    HEADER_ALIASES: HEADER_ALIASES,
    DEFAULT_CONTROLS: DEFAULT_CONTROLS,
    parseCsv: parseCsv,
    parseCsvText: parseCsvText,
    parseBrandTerms: parseBrandTerms,
    normalizeControls: normalizeControls,
    queryContainsBrand: queryContainsBrand,
    analyzeParsedData: analyzeParsedData,
    analyzeCsvText: analyzeCsvText,
    buildExportPayload: buildExportPayload,
    serializeResultsToJson: serializeResultsToJson,
    serializeResultsToCsv: serializeResultsToCsv,
    buildCopySummary: buildCopySummary,
    initBrowser: initBrowser,
  };
});
