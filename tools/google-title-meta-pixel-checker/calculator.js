(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.GoogleTitleMetaPixelChecker = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const LIMITS = {
    titleDesktop: { label: 'Title · desktop', maxPx: 580, scale: 1.02 },
    titleMobile: { label: 'Title · mobile', maxPx: 430, scale: 0.92 },
    descriptionDesktop: { label: 'Description · desktop', maxPx: 920, scale: 0.88 },
    descriptionMobile: { label: 'Description · mobile', maxPx: 680, scale: 0.82 }
  };

  const BASE_WIDTHS = {
    space: 3.8,
    narrow: 4.8,
    punctuation: 5.4,
    digit: 7.3,
    lower: 7.6,
    upper: 8.7,
    wide: 10.8,
    ellipsis: 8.2,
    cjk: 15.4,
    emoji: 16.2,
    other: 8.0
  };

  const NARROW_CHARS = new Set('fijlrtI1|:;.,!`\'" ');
  const WIDE_CHARS = new Set('MWQGODCU@#%&mw');
  const PUNCTUATION_CHARS = new Set('-_+=/\\()[]{}<>?~^*');
  const STATUS_COPY = {
    safe: 'Safe',
    tight: 'Tight',
    over: 'Over'
  };
  const SAMPLE_INPUT = {
    title: 'Google Title Pixel Width Checker for SERP QA',
    description: 'Measure title tag and meta description width in pixels, spot truncation risk on desktop and mobile, and trim your snippet before publishing.',
    urlPath: 'tools/google-title-meta-pixel-checker/'
  };

  function round(value, digits) {
    const places = digits == null ? 1 : digits;
    const factor = Math.pow(10, places);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function normalizeText(value) {
    return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
  }

  function isCjk(char) {
    return /[\u1100-\u11ff\u2e80-\u2eff\u2f00-\u2fdf\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/.test(char);
  }

  function isEmoji(char) {
    return /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(char);
  }

  function baseCharWidth(char) {
    if (!char) return 0;
    if (char === '…') return BASE_WIDTHS.ellipsis;
    if (char === ' ') return BASE_WIDTHS.space;
    if (isEmoji(char)) return BASE_WIDTHS.emoji;
    if (isCjk(char)) return BASE_WIDTHS.cjk;
    if (NARROW_CHARS.has(char)) return BASE_WIDTHS.narrow;
    if (WIDE_CHARS.has(char)) return BASE_WIDTHS.wide;
    if (PUNCTUATION_CHARS.has(char)) return BASE_WIDTHS.punctuation;
    if (/[0-9]/.test(char)) return BASE_WIDTHS.digit;
    if (/[A-Z]/.test(char)) return BASE_WIDTHS.upper;
    if (/[a-z]/.test(char)) return BASE_WIDTHS.lower;
    return BASE_WIDTHS.other;
  }

  function measurePixelWidth(text, variantKey) {
    const variant = LIMITS[variantKey];
    if (!variant) throw new Error('Unknown variant: ' + variantKey);
    const normalized = normalizeText(text);
    let total = 0;
    for (const char of normalized) {
      total += baseCharWidth(char) * variant.scale;
    }
    return round(total, 1);
  }

  function classifyWidth(pixelWidth, maxPx) {
    const ratio = maxPx > 0 ? pixelWidth / maxPx : 0;
    if (ratio > 1) return 'over';
    if (ratio >= 0.9) return 'tight';
    return 'safe';
  }

  function formatPx(value) {
    return round(value, 1).toFixed(1) + 'px';
  }

  function trimToFit(text, variantKey, maxPx) {
    const normalized = normalizeText(text);
    if (!normalized) return '';
    if (measurePixelWidth(normalized, variantKey) <= maxPx) return normalized;

    const ellipsisWidth = measurePixelWidth('…', variantKey);
    let result = '';

    for (const char of normalized) {
      const next = result + char;
      if (measurePixelWidth(next, variantKey) + ellipsisWidth > maxPx) break;
      result = next;
    }

    result = result.replace(/[\s,.;:!?\-–—]+$/g, '').trim();
    return result ? result + '…' : '…';
  }

  function analyzeField(text, desktopKey, mobileKey) {
    const normalized = normalizeText(text);
    const characters = normalized.length;
    const desktopPx = measurePixelWidth(normalized, desktopKey);
    const mobilePx = measurePixelWidth(normalized, mobileKey);
    const desktopMax = LIMITS[desktopKey].maxPx;
    const mobileMax = LIMITS[mobileKey].maxPx;
    const desktopStatus = classifyWidth(desktopPx, desktopMax);
    const mobileStatus = classifyWidth(mobilePx, mobileMax);
    return {
      text: normalized,
      characters: characters,
      desktop: {
        variant: desktopKey,
        pixelWidth: desktopPx,
        maxPx: desktopMax,
        status: desktopStatus,
        label: LIMITS[desktopKey].label,
        remainingPx: round(desktopMax - desktopPx, 1),
        trimSuggestion: trimToFit(normalized, desktopKey, desktopMax)
      },
      mobile: {
        variant: mobileKey,
        pixelWidth: mobilePx,
        maxPx: mobileMax,
        status: mobileStatus,
        label: LIMITS[mobileKey].label,
        remainingPx: round(mobileMax - mobilePx, 1),
        trimSuggestion: trimToFit(normalized, mobileKey, mobileMax)
      }
    };
  }

  function normalizeUrlPath(input) {
    const raw = normalizeText(input);
    if (!raw) return 'example.com/tools/google-title-meta-pixel-checker/';
    if (/^https?:\/\//i.test(raw)) {
      return raw.replace(/^https?:\/\//i, '');
    }
    return 'example.com/' + raw.replace(/^\/+/, '');
  }

  function analyzeSnippet(input) {
    const title = analyzeField(input && input.title, 'titleDesktop', 'titleMobile');
    const description = analyzeField(input && input.description, 'descriptionDesktop', 'descriptionMobile');
    const urlPath = normalizeUrlPath(input && input.urlPath);

    return {
      title: title,
      description: description,
      urlPath: urlPath,
      caveat: 'Pixel widths are estimated from a weighted character model, not exact Google rendering.',
      generatedAt: new Date().toISOString()
    };
  }

  function buildAuditSummary(result) {
    return [
      '[Google Title & Meta Pixel Width Checker]',
      'Title: ' + (result.title.text || '(empty)'),
      'Title desktop: ' + STATUS_COPY[result.title.desktop.status] + ' · ' + formatPx(result.title.desktop.pixelWidth) + ' / ' + formatPx(result.title.desktop.maxPx),
      'Title mobile: ' + STATUS_COPY[result.title.mobile.status] + ' · ' + formatPx(result.title.mobile.pixelWidth) + ' / ' + formatPx(result.title.mobile.maxPx),
      'Description desktop: ' + STATUS_COPY[result.description.desktop.status] + ' · ' + formatPx(result.description.desktop.pixelWidth) + ' / ' + formatPx(result.description.desktop.maxPx),
      'Description mobile: ' + STATUS_COPY[result.description.mobile.status] + ' · ' + formatPx(result.description.mobile.pixelWidth) + ' / ' + formatPx(result.description.mobile.maxPx),
      'Caveat: ' + result.caveat
    ].join('\n');
  }

  function formatSignedPx(value) {
    return (value > 0 ? '+' : '') + formatPx(value);
  }

  function updateMetricCard(refs, prefix, data) {
    refs[prefix + 'Px'].textContent = formatPx(data.pixelWidth);
    refs[prefix + 'Status'].textContent = STATUS_COPY[data.status];
    refs[prefix + 'Status'].className = 'status-pill ' + data.status;
    refs[prefix + 'Budget'].textContent = data.remainingPx >= 0
      ? formatSignedPx(data.remainingPx) + ' left'
      : formatPx(Math.abs(data.remainingPx)) + ' over';
    refs[prefix + 'Trim'].textContent = data.trimSuggestion || '—';
  }

  function render(result, refs) {
    refs.titleCharCount.textContent = String(result.title.characters);
    refs.descriptionCharCount.textContent = String(result.description.characters);
    updateMetricCard(refs, 'titleDesktop', result.title.desktop);
    updateMetricCard(refs, 'titleMobile', result.title.mobile);
    updateMetricCard(refs, 'descriptionDesktop', result.description.desktop);
    updateMetricCard(refs, 'descriptionMobile', result.description.mobile);

    refs.desktopUrl.textContent = result.urlPath;
    refs.mobileUrl.textContent = result.urlPath;
    refs.desktopTitle.textContent = result.title.desktop.trimSuggestion || 'Untitled result';
    refs.mobileTitle.textContent = result.title.mobile.trimSuggestion || 'Untitled result';
    refs.desktopDescription.textContent = result.description.desktop.trimSuggestion || 'Add a meta description to preview how your snippet could appear in search.';
    refs.mobileDescription.textContent = result.description.mobile.trimSuggestion || 'Add a meta description to preview how your snippet could appear in search.';
    refs.summary.value = buildAuditSummary(result);
    refs.status.textContent = result.caveat;
  }

  function collectRefs() {
    const ids = [
      'titleInput', 'descriptionInput', 'urlPathInput', 'titleCharCount', 'descriptionCharCount',
      'titleDesktopPx', 'titleDesktopStatus', 'titleDesktopBudget', 'titleDesktopTrim',
      'titleMobilePx', 'titleMobileStatus', 'titleMobileBudget', 'titleMobileTrim',
      'descriptionDesktopPx', 'descriptionDesktopStatus', 'descriptionDesktopBudget', 'descriptionDesktopTrim',
      'descriptionMobilePx', 'descriptionMobileStatus', 'descriptionMobileBudget', 'descriptionMobileTrim',
      'desktopUrl', 'desktopTitle', 'desktopDescription',
      'mobileUrl', 'mobileTitle', 'mobileDescription',
      'summary', 'status', 'sampleBtn', 'resetBtn', 'copyBtn'
    ];

    const refs = {};
    for (const id of ids) {
      refs[id] = document.getElementById(id);
    }
    return refs;
  }

  function sync(refs) {
    const result = analyzeSnippet({
      title: refs.titleInput.value,
      description: refs.descriptionInput.value,
      urlPath: refs.urlPathInput.value
    });
    render(result, refs);
    return result;
  }

  function mount() {
    if (typeof document === 'undefined') return;
    const refs = collectRefs();
    if (!refs.titleInput) return;

    function applySample() {
      refs.titleInput.value = SAMPLE_INPUT.title;
      refs.descriptionInput.value = SAMPLE_INPUT.description;
      refs.urlPathInput.value = SAMPLE_INPUT.urlPath;
      sync(refs);
    }

    function resetInputs() {
      refs.titleInput.value = '';
      refs.descriptionInput.value = '';
      refs.urlPathInput.value = 'tools/google-title-meta-pixel-checker/';
      sync(refs);
    }

    refs.titleInput.addEventListener('input', function () { sync(refs); });
    refs.descriptionInput.addEventListener('input', function () { sync(refs); });
    refs.urlPathInput.addEventListener('input', function () { sync(refs); });
    refs.sampleBtn.addEventListener('click', applySample);
    refs.resetBtn.addEventListener('click', resetInputs);
    refs.copyBtn.addEventListener('click', async function () {
      const result = sync(refs);
      try {
        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(buildAuditSummary(result));
          refs.status.textContent = 'Audit summary copied.';
        }
      } catch (error) {
        refs.status.textContent = 'Copy failed. You can still copy from the summary box.';
      }
    });

    applySample();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', mount);
    } else {
      mount();
    }
  }

  return {
    LIMITS: LIMITS,
    SAMPLE_INPUT: SAMPLE_INPUT,
    normalizeText: normalizeText,
    measurePixelWidth: measurePixelWidth,
    classifyWidth: classifyWidth,
    trimToFit: trimToFit,
    analyzeField: analyzeField,
    analyzeSnippet: analyzeSnippet,
    buildAuditSummary: buildAuditSummary,
    baseCharWidth: baseCharWidth,
    normalizeUrlPath: normalizeUrlPath,
    formatPx: formatPx
  };
});
