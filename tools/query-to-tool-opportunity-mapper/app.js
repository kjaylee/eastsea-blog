(function (global, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.QueryToToolOpportunityMapper = api;
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    window.addEventListener('DOMContentLoaded', function () {
      api.initBrowser();
    });
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const REQUIRED_KEYS = ['query', 'clicks', 'impressions', 'position'];
  const HEADER_ALIASES = {
    query: ['query', 'Query', 'Queries', 'Top queries', '검색어'],
    clicks: ['clicks', 'Clicks', '클릭수'],
    impressions: ['impressions', 'Impressions', '노출수'],
    ctr: ['ctr', 'CTR', '평균 CTR'],
    position: ['position', 'Position', 'Average position', '평균 게재순위'],
    page: ['page', 'Page', 'Top page', 'Landing page', '페이지'],
  };
  const UTILITY_TOKENS = ['calculator', 'estimator', 'checker', 'validator', 'generator', 'planner', 'converter', 'analyzer'];
  const CANONICAL_INTENT_MAP = {
    calculator: 'calculator',
    estimator: 'calculator',
    checker: 'checker',
    validator: 'checker',
    generator: 'generator',
    planner: 'planner',
    converter: 'converter',
    analyzer: 'analyzer',
  };
  const INTENT_PRIORITY = ['calculator', 'checker', 'planner', 'generator', 'converter', 'analyzer'];
  const FILLER_TOKENS = new Set(['free', 'online', 'tool', 'tools', 'best', 'simple', 'template']);
  const MONETIZATION_TOKENS = new Set(['revenue', 'profit', 'fee', 'fees', 'pricing', 'price', 'margin', 'commission', 'roi', 'tax', 'subscription', 'paywall', 'refund']);
  const BRAND_CASE_OVERRIDES = {
    youtube: 'YouTube',
    ebay: 'eBay',
    etsy: 'Etsy',
    google: 'Google',
    shopify: 'Shopify',
  };
  const INTENT_WEIGHTS = {
    calculator: 25,
    checker: 22,
    planner: 22,
    generator: 18,
    converter: 18,
    analyzer: 16,
  };
  const COVERAGE_WEIGHTS = {
    'no-page': 12,
    'weak-page': 8,
    'mixed-pages': 6,
    'exactish-page': 0,
  };
  const TABLE_COLUMNS = [
    { key: 'rank', label: 'Rank', type: 'number' },
    { key: 'toolSlug', label: 'toolSlug', type: 'string' },
    { key: 'toolTitle', label: 'toolTitle', type: 'string' },
    { key: 'intentType', label: 'intentType', type: 'string' },
    { key: 'baseTerm', label: 'baseTerm', type: 'string' },
    { key: 'opportunityScore', label: 'opportunityScore', type: 'number' },
    { key: 'supportCount', label: 'supportCount', type: 'number' },
    { key: 'totalImpressions', label: 'totalImpressions', type: 'number' },
    { key: 'totalClicks', label: 'totalClicks', type: 'number' },
    { key: 'clusterCtr', label: 'clusterCtr', type: 'percent' },
    { key: 'avgPosition', label: 'avgPosition', type: 'number' },
    { key: 'coverageStatus', label: 'coverageStatus', type: 'string' },
    { key: 'whyNow', label: 'whyNow', type: 'string' },
    { key: 'monetizationHint', label: 'monetizationHint', type: 'string' },
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

  function tokenizeText(value) {
    return String(value || '')
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  }

  function canonicalizeIntent(token) {
    return CANONICAL_INTENT_MAP[token] || null;
  }

  function titleCaseToken(token) {
    if (BRAND_CASE_OVERRIDES[token]) {
      return BRAND_CASE_OVERRIDES[token];
    }
    return token.charAt(0).toUpperCase() + token.slice(1);
  }

  function displayCaseText(value) {
    return String(value || '')
      .split(/\s+/)
      .filter(Boolean)
      .map(titleCaseToken)
      .join(' ');
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
      const raw = {};
      Object.keys(logicalColumns).forEach(function (key) {
        raw[key] = String(cells[logicalColumns[key]] || '').trim();
      });

      const rawQuery = String(raw.query || '').trim();
      const clicks = parseNumberCell(raw.clicks);
      const impressions = parseNumberCell(raw.impressions);
      const position = parseNumberCell(raw.position);
      const page = String(raw.page || '').trim();
      const rawCtr = raw.ctr ? parseNumberCell(raw.ctr) : null;

      const isInvalid = (
        !rawQuery ||
        clicks == null ||
        impressions == null ||
        position == null ||
        impressions <= 0
      );

      if (isInvalid) {
        invalidRows += 1;
        return;
      }

      rows.push({
        rowNumber: dataIndex + 2,
        rawQuery: rawQuery,
        normalizedQuery: tokenizeText(rawQuery).join(' '),
        clicks: clicks,
        impressions: impressions,
        position: position,
        ctr: roundTo(clicks / impressions, 6),
        rawCtr: rawCtr,
        page: page,
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

  function normalizeUtilityRow(row) {
    const tokens = tokenizeText(row.rawQuery);
    const filtered = [];
    const intentsSeen = [];

    tokens.forEach(function (token) {
      if (FILLER_TOKENS.has(token)) {
        return;
      }
      const canonicalIntent = canonicalizeIntent(token);
      if (canonicalIntent) {
        intentsSeen.push(canonicalIntent);
        return;
      }
      filtered.push(token);
    });

    if (!intentsSeen.length) {
      return { ok: false, exclusionReason: 'nonUtility' };
    }

    if (!filtered.length) {
      return { ok: false, exclusionReason: 'emptyBaseTerm' };
    }

    return {
      ok: true,
      rowNumber: row.rowNumber,
      rawQuery: row.rawQuery,
      normalizedQuery: row.normalizedQuery,
      clicks: row.clicks,
      impressions: row.impressions,
      position: row.position,
      ctr: row.ctr,
      page: row.page,
      intents: Array.from(new Set(intentsSeen)),
      baseTokens: filtered,
      baseTerm: filtered.join(' '),
    };
  }

  function resolveIntentType(intentSet) {
    for (let index = 0; index < INTENT_PRIORITY.length; index += 1) {
      if (intentSet.has(INTENT_PRIORITY[index])) {
        return INTENT_PRIORITY[index];
      }
    }
    return 'calculator';
  }

  function extractFinalSlugSegment(pageUrl) {
    if (!pageUrl) return '';
    try {
      const parsed = new URL(pageUrl, 'https://example.com');
      const parts = parsed.pathname.split('/').filter(Boolean);
      return decodeURIComponent(parts.length ? parts[parts.length - 1] : '');
    } catch (error) {
      const parts = String(pageUrl).split('/').filter(Boolean);
      return parts.length ? parts[parts.length - 1] : '';
    }
  }

  function tokenizeSlug(slug) {
    return String(slug || '')
      .toLowerCase()
      .split('-')
      .map(function (token) { return token.trim(); })
      .filter(Boolean);
  }

  function classifyCoverage(baseTokens, intentType, coveragePages) {
    if (!coveragePages.length) {
      return 'no-page';
    }
    if (coveragePages.length > 1) {
      return 'mixed-pages';
    }

    const slugTokens = tokenizeSlug(extractFinalSlugSegment(coveragePages[0]));
    const slugTokenSet = new Set(slugTokens);
    const sharedBaseTokens = baseTokens.filter(function (token) {
      return slugTokenSet.has(token);
    }).length;
    const slugOverlap = baseTokens.length ? sharedBaseTokens / baseTokens.length : 0;
    const hasIntent = slugTokenSet.has(intentType);
    return slugOverlap >= 0.6 && hasIntent ? 'exactish-page' : 'weak-page';
  }

  function hasMonetizationBoost(baseTokens) {
    return baseTokens.some(function (token) {
      return MONETIZATION_TOKENS.has(token);
    });
  }

  function buildToolSlug(baseTokens, intentType) {
    return baseTokens.join('-') + '-' + intentType;
  }

  function buildToolTitle(baseTerm, intentType) {
    return displayCaseText(baseTerm) + ' ' + displayCaseText(intentType);
  }

  function buildWhyNow(coverageStatus, monetizationWeight) {
    if (coverageStatus === 'no-page' && monetizationWeight > 0) {
      return 'High-impression monetization demand with no mapped page.';
    }
    if (coverageStatus === 'weak-page' && monetizationWeight > 0) {
      return 'Commercial-intent demand is landing on a weakly matched page.';
    }
    if (coverageStatus === 'weak-page') {
      return 'Search demand exists, but the current page match is weak.';
    }
    if (coverageStatus === 'mixed-pages') {
      return 'Demand is split across multiple pages; a dedicated tool can consolidate intent.';
    }
    return 'Utility-intent demand is present and worth packaging as a dedicated tool.';
  }

  function buildBrief(intentType, toolTitle) {
    const templates = {
      calculator: 'Build a static calculator for ' + toolTitle + ' with transparent inputs, formula disclosure, instant results, and exportable summaries.',
      checker: 'Build a static checker for ' + toolTitle + ' with clear pass/fail outputs, thresholds, and copyable recommendations.',
      planner: 'Build a static planner for ' + toolTitle + ' with editable inputs, scenario comparison, and exportable action steps.',
      generator: 'Build a static generator for ' + toolTitle + ' with presets, copy-ready outputs, and fast iteration.',
      converter: 'Build a static converter for ' + toolTitle + ' with instant conversion, unit explanations, and copy/export actions.',
      analyzer: 'Build a static analyzer for ' + toolTitle + ' with scored diagnostics, explanation blocks, and exportable summaries.',
    };
    return templates[intentType] || templates.calculator;
  }

  function buildMonetizationHint(intentType, monetizationWeight) {
    if (monetizationWeight > 0) {
      return 'Ads + affiliate links + lead capture for commercial workflows.';
    }
    if (intentType === 'generator') {
      return 'Ads + premium template pack or newsletter capture.';
    }
    return 'Ads + internal links to adjacent tools.';
  }

  function createEmptyCluster(baseTerm, baseTokens) {
    return {
      baseTerm: baseTerm,
      baseTokens: baseTokens.slice(),
      intentSet: new Set(),
      supportCount: 0,
      totalClicks: 0,
      totalImpressions: 0,
      weightedPositionSum: 0,
      coveragePages: [],
      coveragePageSet: new Set(),
      supportingQueries: [],
      rows: [],
    };
  }

  function finalizeCluster(cluster) {
    const intentType = resolveIntentType(cluster.intentSet);
    const clusterCtr = cluster.totalImpressions > 0 ? cluster.totalClicks / cluster.totalImpressions : 0;
    const avgPosition = cluster.totalImpressions > 0 ? cluster.weightedPositionSum / cluster.totalImpressions : 0;
    const coverageStatus = classifyCoverage(cluster.baseTokens, intentType, cluster.coveragePages);
    const monetizationWeight = hasMonetizationBoost(cluster.baseTokens) ? 15 : 0;
    const specificityWeight = Math.min(Math.max(cluster.baseTokens.length - 1, 0) * 2, 10);
    const demandWeight = Math.min(Math.round(cluster.totalImpressions / 50), 25);
    const ctrGapWeight = clusterCtr < 0.04 && avgPosition <= 10 ? 8 : 0;
    const scoreBreakdown = {
      intentWeight: INTENT_WEIGHTS[intentType],
      coverageWeight: COVERAGE_WEIGHTS[coverageStatus],
      monetizationWeight: monetizationWeight,
      specificityWeight: specificityWeight,
      demandWeight: demandWeight,
      ctrGapWeight: ctrGapWeight,
    };
    const opportunityScore = scoreBreakdown.intentWeight +
      scoreBreakdown.coverageWeight +
      scoreBreakdown.monetizationWeight +
      scoreBreakdown.specificityWeight +
      scoreBreakdown.demandWeight +
      scoreBreakdown.ctrGapWeight;
    const lowDemand = cluster.totalImpressions < 100 || cluster.totalClicks < 5 || cluster.supportCount < 1;
    const alreadyCovered = coverageStatus === 'exactish-page' && clusterCtr >= 0.05 && avgPosition <= 3;
    const toolSlug = buildToolSlug(cluster.baseTokens, intentType);
    const toolTitle = buildToolTitle(cluster.baseTerm, intentType);

    return {
      toolSlug: toolSlug,
      toolTitle: toolTitle,
      intentType: intentType,
      baseTerm: cluster.baseTerm,
      opportunityScore: opportunityScore,
      supportCount: cluster.supportCount,
      totalClicks: roundTo(cluster.totalClicks, 6),
      totalImpressions: roundTo(cluster.totalImpressions, 6),
      clusterCtr: roundTo(clusterCtr, 6),
      avgPosition: roundTo(avgPosition, 6),
      coverageStatus: coverageStatus,
      coveragePages: cluster.coveragePages.slice(),
      supportingQueries: cluster.supportingQueries.slice(),
      scoreBreakdown: scoreBreakdown,
      whyNow: buildWhyNow(coverageStatus, monetizationWeight),
      buildBrief: buildBrief(intentType, toolTitle),
      monetizationHint: buildMonetizationHint(intentType, monetizationWeight),
      exclusionReason: lowDemand ? 'lowDemand' : (alreadyCovered ? 'alreadyCovered' : null),
      baseTokens: cluster.baseTokens.slice(),
    };
  }

  function analyzeParsedData(parsed) {
    if (!parsed || !parsed.ok) {
      return parsed;
    }

    const summary = {
      parsedRows: parsed.parsedRows,
      validRows: parsed.validRows,
      utilityRows: 0,
      clusters: 0,
      rankedClusters: 0,
      excludedClusters: 0,
      invalidRows: parsed.invalidRows,
      exclusions: {
        nonUtility: 0,
        emptyBaseTerm: 0,
        lowDemand: 0,
        alreadyCovered: 0,
      },
    };

    const normalizedRows = [];
    parsed.rows.forEach(function (row) {
      const normalized = normalizeUtilityRow(row);
      if (!normalized.ok) {
        summary.exclusions[normalized.exclusionReason] += 1;
        return;
      }
      summary.utilityRows += 1;
      normalizedRows.push(normalized);
    });

    const clusterMap = new Map();
    normalizedRows.forEach(function (row) {
      if (!clusterMap.has(row.baseTerm)) {
        clusterMap.set(row.baseTerm, createEmptyCluster(row.baseTerm, row.baseTokens));
      }
      const cluster = clusterMap.get(row.baseTerm);
      cluster.supportCount += 1;
      cluster.totalClicks += row.clicks;
      cluster.totalImpressions += row.impressions;
      cluster.weightedPositionSum += row.position * row.impressions;
      cluster.supportingQueries.push(row.rawQuery);
      cluster.rows.push(row);
      row.intents.forEach(function (intent) {
        cluster.intentSet.add(intent);
      });
      if (row.page && !cluster.coveragePageSet.has(row.page)) {
        cluster.coveragePageSet.add(row.page);
        cluster.coveragePages.push(row.page);
      }
    });

    const allClusters = Array.from(clusterMap.values()).map(finalizeCluster);
    summary.clusters = allClusters.length;

    const ranked = [];
    const excluded = [];
    allClusters.forEach(function (cluster) {
      if (cluster.exclusionReason) {
        summary.exclusions[cluster.exclusionReason] += 1;
        excluded.push(cluster);
        return;
      }
      ranked.push(cluster);
    });

    ranked.sort(function (left, right) {
      if (right.opportunityScore !== left.opportunityScore) return right.opportunityScore - left.opportunityScore;
      if (right.totalImpressions !== left.totalImpressions) return right.totalImpressions - left.totalImpressions;
      if (right.totalClicks !== left.totalClicks) return right.totalClicks - left.totalClicks;
      return left.toolSlug.localeCompare(right.toolSlug);
    });

    ranked.forEach(function (row, index) {
      row.rank = index + 1;
    });

    summary.rankedClusters = ranked.length;
    summary.excludedClusters = excluded.length;

    return {
      ok: true,
      summary: summary,
      results: ranked,
      excludedResults: excluded,
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

  function buildExportPayload(analysis, options) {
    return {
      generatedAt: options && options.generatedAt ? options.generatedAt : new Date().toISOString(),
      summary: analysis.summary,
      results: analysis.results.map(function (row) {
        return {
          rank: row.rank,
          toolSlug: row.toolSlug,
          toolTitle: row.toolTitle,
          intentType: row.intentType,
          baseTerm: row.baseTerm,
          opportunityScore: row.opportunityScore,
          supportCount: row.supportCount,
          totalImpressions: row.totalImpressions,
          totalClicks: row.totalClicks,
          clusterCtr: row.clusterCtr,
          avgPosition: row.avgPosition,
          coverageStatus: row.coverageStatus,
          coveragePages: row.coveragePages.slice(),
          scoreBreakdown: Object.assign({}, row.scoreBreakdown),
          whyNow: row.whyNow,
          buildBrief: row.buildBrief,
          monetizationHint: row.monetizationHint,
          supportingQueries: row.supportingQueries.slice(),
        };
      }),
    };
  }

  function serializeResultsToJson(analysis, options) {
    return JSON.stringify(buildExportPayload(analysis, options), null, 2);
  }

  function serializeResultsToCsv(analysis) {
    const columns = [
      'rank',
      'toolSlug',
      'toolTitle',
      'intentType',
      'baseTerm',
      'opportunityScore',
      'supportCount',
      'totalImpressions',
      'totalClicks',
      'clusterCtr',
      'avgPosition',
      'coverageStatus',
      'whyNow',
      'monetizationHint',
    ];
    const lines = [columns.join(',')];
    analysis.results.forEach(function (row) {
      lines.push(columns.map(function (column) {
        return escapeCsvCell(row[column]);
      }).join(','));
    });
    return lines.join('\n');
  }

  function formatInteger(value) {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
  }

  function formatNumber(value) {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 }).format(value);
  }

  function formatPercent(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
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

  function renderListItems(values, emptyLabel) {
    if (!values.length) {
      return '<li>' + escapeHtml(emptyLabel) + '</li>';
    }
    return values.map(function (value) {
      return '<li>' + escapeHtml(value) + '</li>';
    }).join('');
  }

  function initBrowser() {
    if (typeof document === 'undefined') {
      return;
    }

    const refs = {
      csvFileInput: document.getElementById('csvFileInput'),
      loadFixtureBtn: document.getElementById('loadFixtureBtn'),
      exportJsonBtn: document.getElementById('exportJsonBtn'),
      exportCsvBtn: document.getElementById('exportCsvBtn'),
      fileStatus: document.getElementById('fileStatus'),
      errorBox: document.getElementById('errorBox'),
      errorText: document.getElementById('errorText'),
      summaryParsedRows: document.getElementById('summaryParsedRows'),
      summaryValidRows: document.getElementById('summaryValidRows'),
      summaryUtilityRows: document.getElementById('summaryUtilityRows'),
      summaryClusters: document.getElementById('summaryClusters'),
      summaryRankedClusters: document.getElementById('summaryRankedClusters'),
      summaryExcludedClusters: document.getElementById('summaryExcludedClusters'),
      summaryInvalidRows: document.getElementById('summaryInvalidRows'),
      summaryNonUtility: document.getElementById('summaryNonUtility'),
      summaryEmptyBaseTerm: document.getElementById('summaryEmptyBaseTerm'),
      summaryLowDemand: document.getElementById('summaryLowDemand'),
      summaryAlreadyCovered: document.getElementById('summaryAlreadyCovered'),
      emptyState: document.getElementById('emptyState'),
      tableWrap: document.getElementById('tableWrap'),
      resultsBody: document.getElementById('resultsBody'),
      detailPanel: document.getElementById('detailPanel'),
      detailTitle: document.getElementById('detailTitle'),
      detailMeta: document.getElementById('detailMeta'),
      detailQueries: document.getElementById('detailQueries'),
      detailPages: document.getElementById('detailPages'),
      detailScoreBreakdown: document.getElementById('detailScoreBreakdown'),
      detailBuildBrief: document.getElementById('detailBuildBrief'),
      detailWhyNow: document.getElementById('detailWhyNow'),
      detailMonetizationHint: document.getElementById('detailMonetizationHint'),
    };

    if (!refs.csvFileInput || !refs.resultsBody) {
      return;
    }

    const state = {
      csvText: '',
      fileName: '',
      analysis: null,
      selectedRank: null,
    };

    function setError(message) {
      refs.errorBox.classList.toggle('hidden', !message);
      refs.errorText.textContent = message || '';
    }

    function setFileStatus(message) {
      refs.fileStatus.textContent = message;
    }

    function setSummary(summary) {
      refs.summaryParsedRows.textContent = formatInteger(summary.parsedRows);
      refs.summaryValidRows.textContent = formatInteger(summary.validRows);
      refs.summaryUtilityRows.textContent = formatInteger(summary.utilityRows);
      refs.summaryClusters.textContent = formatInteger(summary.clusters);
      refs.summaryRankedClusters.textContent = formatInteger(summary.rankedClusters);
      refs.summaryExcludedClusters.textContent = formatInteger(summary.excludedClusters);
      refs.summaryInvalidRows.textContent = formatInteger(summary.invalidRows);
      refs.summaryNonUtility.textContent = formatInteger(summary.exclusions.nonUtility);
      refs.summaryEmptyBaseTerm.textContent = formatInteger(summary.exclusions.emptyBaseTerm);
      refs.summaryLowDemand.textContent = formatInteger(summary.exclusions.lowDemand);
      refs.summaryAlreadyCovered.textContent = formatInteger(summary.exclusions.alreadyCovered);
    }

    function resetSummary() {
      setSummary({
        parsedRows: 0,
        validRows: 0,
        utilityRows: 0,
        clusters: 0,
        rankedClusters: 0,
        excludedClusters: 0,
        invalidRows: 0,
        exclusions: { nonUtility: 0, emptyBaseTerm: 0, lowDemand: 0, alreadyCovered: 0 },
      });
      refs.resultsBody.innerHTML = '';
      refs.tableWrap.classList.add('hidden');
      refs.emptyState.classList.remove('hidden');
      refs.exportJsonBtn.disabled = true;
      refs.exportCsvBtn.disabled = true;
      refs.detailPanel.classList.add('hidden');
      refs.detailTitle.textContent = 'No detail selected yet';
      refs.detailMeta.textContent = 'Load a fixture or upload a CSV to inspect one ranked cluster.';
      refs.detailQueries.innerHTML = '<li>No supporting queries yet.</li>';
      refs.detailPages.innerHTML = '<li>No mapped pages yet.</li>';
      refs.detailScoreBreakdown.innerHTML = '<li>Upload a CSV to compute score components.</li>';
      refs.detailBuildBrief.textContent = '—';
      refs.detailWhyNow.textContent = '—';
      refs.detailMonetizationHint.textContent = '—';
      state.selectedRank = null;
    }

    function renderDetail(rank) {
      if (!state.analysis || !state.analysis.ok) {
        refs.detailPanel.classList.add('hidden');
        return;
      }
      const match = state.analysis.results.find(function (row) {
        return row.rank === rank;
      });
      if (!match) {
        refs.detailPanel.classList.add('hidden');
        return;
      }
      state.selectedRank = rank;
      refs.detailPanel.classList.remove('hidden');
      refs.detailTitle.textContent = match.toolTitle;
      refs.detailMeta.textContent = match.toolSlug + ' · ' + match.coverageStatus + ' · score ' + match.opportunityScore;
      refs.detailQueries.innerHTML = renderListItems(match.supportingQueries, 'No supporting queries.');
      refs.detailPages.innerHTML = renderListItems(match.coveragePages, 'No mapped pages.');
      refs.detailScoreBreakdown.innerHTML = Object.keys(match.scoreBreakdown).map(function (key) {
        return '<li><strong>' + escapeHtml(key) + '</strong>: ' + escapeHtml(String(match.scoreBreakdown[key])) + '</li>';
      }).join('');
      refs.detailBuildBrief.textContent = match.buildBrief;
      refs.detailWhyNow.textContent = match.whyNow;
      refs.detailMonetizationHint.textContent = match.monetizationHint;
      Array.from(refs.resultsBody.querySelectorAll('button[data-rank]')).forEach(function (button) {
        const isActive = Number(button.getAttribute('data-rank')) === rank;
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    }

    function renderTable() {
      if (!state.analysis || !state.analysis.ok || !state.analysis.results.length) {
        refs.tableWrap.classList.add('hidden');
        refs.emptyState.classList.remove('hidden');
        refs.resultsBody.innerHTML = '';
        refs.detailPanel.classList.add('hidden');
        return;
      }

      refs.resultsBody.innerHTML = state.analysis.results.map(function (row) {
        return '<tr>' +
          '<td class="num">' + escapeHtml(String(row.rank)) + '</td>' +
          '<td class="mono"><button class="row-select" type="button" data-rank="' + escapeHtml(String(row.rank)) + '" aria-pressed="false">' + escapeHtml(row.toolSlug) + '</button></td>' +
          TABLE_COLUMNS.slice(2).map(function (column) {
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
      refs.tableWrap.classList.remove('hidden');
      refs.emptyState.classList.add('hidden');
      renderDetail(state.selectedRank || state.analysis.results[0].rank);
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
      renderTable();
      refs.exportJsonBtn.disabled = false;
      refs.exportCsvBtn.disabled = false;
    }

    function runAnalysis() {
      if (!state.csvText.trim()) {
        setError('Upload a CSV or load the sample fixture first.');
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
        setError('Could not read the selected CSV file.');
      };
      reader.readAsText(file);
    });

    refs.loadFixtureBtn.addEventListener('click', function () {
      fetch('./fixtures/sample-gsc-query-export.csv')
        .then(function (response) {
          if (!response.ok) {
            throw new Error('Fixture request failed with status ' + response.status + '.');
          }
          return response.text();
        })
        .then(function (text) {
          ingestText(text, 'sample-gsc-query-export.csv');
        })
        .catch(function (error) {
          setError('Could not load the sample fixture. ' + error.message);
        });
    });

    refs.exportJsonBtn.addEventListener('click', function () {
      if (!state.analysis || !state.analysis.ok) return;
      downloadText('query-to-tool-opportunity-mapper-export.json', serializeResultsToJson(state.analysis), 'application/json');
    });

    refs.exportCsvBtn.addEventListener('click', function () {
      if (!state.analysis || !state.analysis.ok) return;
      downloadText('query-to-tool-opportunity-mapper-export.csv', serializeResultsToCsv(state.analysis), 'text/csv;charset=utf-8');
    });

    refs.resultsBody.addEventListener('click', function (event) {
      const button = event.target.closest('button[data-rank]');
      if (!button) return;
      renderDetail(Number(button.getAttribute('data-rank')));
    });

    resetSummary();
  }

  return {
    REQUIRED_KEYS: REQUIRED_KEYS,
    HEADER_ALIASES: HEADER_ALIASES,
    UTILITY_TOKENS: UTILITY_TOKENS,
    INTENT_PRIORITY: INTENT_PRIORITY,
    parseCsv: parseCsv,
    parseCsvText: parseCsvText,
    normalizeUtilityRow: normalizeUtilityRow,
    classifyCoverage: classifyCoverage,
    buildExportPayload: buildExportPayload,
    analyzeParsedData: analyzeParsedData,
    analyzeCsvText: analyzeCsvText,
    serializeResultsToJson: serializeResultsToJson,
    serializeResultsToCsv: serializeResultsToCsv,
    initBrowser: initBrowser,
  };
});
