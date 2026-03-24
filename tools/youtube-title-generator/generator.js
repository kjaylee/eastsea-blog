(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  root.YouTubeTitleGenerator = api;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        api.initBrowser();
      }, { once: true });
    } else {
      api.initBrowser();
    }
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const BRAND_CASE = {
    youtube: 'YouTube',
    chatgpt: 'ChatGPT',
    tiktok: 'TikTok',
    instagram: 'Instagram',
    ai: 'AI',
    ios: 'iOS',
    seo: 'SEO',
  };

  const TONE_PACKS = {
    clear: {
      power: ['Clear', 'Practical', 'Simple', 'No-Fluff', 'Straightforward'],
      verbs: ['explains', 'breaks down', 'walks through', 'shows', 'teaches'],
    },
    curiosity: {
      power: ['Curious', 'Unexpected', 'Underrated', 'Hidden', 'Smart'],
      verbs: ['reveals', 'unpacks', 'questions', 'tests', 'challenges'],
    },
    bold: {
      power: ['High-CTR', 'Punchy', 'Scroll-Stopping', 'Sharp', 'Bold'],
      verbs: ['wins', 'grabs', 'hooks', 'pulls', 'lands'],
    },
    friendly: {
      power: ['Easy', 'Helpful', 'Beginner-Friendly', 'Warm', 'Simple'],
      verbs: ['guides', 'helps', 'walks through', 'shows', 'simplifies'],
    },
    urgent: {
      power: ['Fast', 'Now', 'Today', 'Instant', 'Quick'],
      verbs: ['fixes', 'boosts', 'improves', 'rescues', 'unlocks'],
    },
  };

  const FORMAT_HINTS = {
    tutorial: 'tutorial',
    review: 'review',
    vlog: 'vlog',
    shorts: 'Shorts',
    caseStudy: 'case study',
    list: 'list video',
  };

  const NUMBERS = [3, 5, 7, 9, 11, 13, 15];
  const DEFAULTS = {
    topic: 'budget travel',
    primaryKeyword: 'budget travel',
    audience: 'creators',
    outcome: 'more clicks',
    tone: 'curiosity',
    format: 'tutorial',
    count: 12,
  };

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function compactSpace(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function smartCase(text) {
    return compactSpace(text)
      .split(' ')
      .filter(Boolean)
      .map(function (token) {
        const bare = token.toLowerCase().replace(/[^a-z0-9+.#-]/gi, '');
        if (BRAND_CASE[bare]) {
          return token.replace(new RegExp(bare, 'i'), BRAND_CASE[bare]);
        }
        if (/^[A-Z0-9]{2,}$/.test(token)) {
          return token;
        }
        return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
      })
      .join(' ');
  }

  function normalizeOptions(input) {
    const topic = compactSpace(input && input.topic ? input.topic : DEFAULTS.topic);
    const primaryKeyword = compactSpace(input && input.primaryKeyword ? input.primaryKeyword : topic || DEFAULTS.primaryKeyword);
    const audience = compactSpace(input && input.audience ? input.audience : DEFAULTS.audience);
    const outcome = compactSpace(input && input.outcome ? input.outcome : DEFAULTS.outcome);
    const tone = Object.prototype.hasOwnProperty.call(TONE_PACKS, input && input.tone) ? input.tone : DEFAULTS.tone;
    const format = Object.prototype.hasOwnProperty.call(FORMAT_HINTS, input && input.format) ? input.format : DEFAULTS.format;
    const count = clamp(Number.parseInt(input && input.count, 10) || DEFAULTS.count, 6, 24);

    return {
      topic: smartCase(topic),
      primaryKeyword: smartCase(primaryKeyword || topic),
      audience: compactSpace(audience),
      outcome: compactSpace(outcome),
      tone: tone,
      format: format,
      count: count,
    };
  }

  function scoreTitle(title) {
    const length = String(title || '').length;
    const hasNumber = /\b\d+\b/.test(title);
    const hasQuestion = /\?/.test(title);
    const startsStrong = /^(How|Why|What|The|\d+)/.test(title);
    let score = 60;

    if (length >= 45 && length <= 70) score += 20;
    else if (length >= 35 && length <= 80) score += 10;
    else score -= 8;

    if (hasNumber) score += 8;
    if (hasQuestion) score += 4;
    if (startsStrong) score += 4;

    score = clamp(score, 0, 100);
    let verdict = 'okay';
    if (score >= 84) verdict = 'strong';
    else if (score <= 58) verdict = 'needs-trim';

    return {
      score: score,
      verdict: verdict,
      charCount: length,
    };
  }

  function buildTemplates(options) {
    const pack = TONE_PACKS[options.tone];
    const keyword = options.primaryKeyword;
    const topic = options.topic;
    const audience = options.audience;
    const outcome = options.outcome;
    const formatLabel = FORMAT_HINTS[options.format];

    return [
      function (i) { return keyword + ': ' + pack.power[i % pack.power.length] + ' Ideas for ' + audience; },
      function (i) { return 'How to Get ' + smartCase(outcome) + ' with ' + keyword; },
      function (i) { return NUMBERS[i % NUMBERS.length] + ' ' + pack.power[i % pack.power.length] + ' ' + smartCase(topic) + ' Title Ideas'; },
      function (i) { return 'The ' + pack.power[i % pack.power.length] + ' ' + keyword + ' Formula for ' + audience; },
      function (i) { return keyword + ' Mistakes ' + smartCase(audience) + ' Should Stop Making'; },
      function (i) { return 'What Nobody Tells You About ' + keyword; },
      function (i) { return 'Why Your ' + keyword + ' Is Not Getting ' + smartCase(outcome); },
      function (i) { return keyword + ' Examples That ' + pack.verbs[i % pack.verbs.length] + ' More Clicks'; },
      function (i) { return 'Before You Publish: ' + keyword + ' Checklist for ' + audience; },
      function (i) { return 'The Best ' + formatLabel + ' Title for ' + smartCase(topic) + ' Starts Like This'; },
      function (i) { return keyword + ' Templates for ' + audience + ' Who Want ' + smartCase(outcome); },
      function (i) { return 'I Tried ' + NUMBERS[(i + 2) % NUMBERS.length] + ' ' + keyword + ' Hooks - Here Are the Best Ones'; },
      function (i) { return keyword + ': The ' + pack.power[(i + 1) % pack.power.length] + ' Rewrite That Changes CTR'; },
      function (i) { return 'How Top ' + smartCase(audience) + ' Write a ' + pack.power[i % pack.power.length] + ' ' + keyword; },
      function (i) { return keyword + ' for ' + smartCase(topic) + ': ' + NUMBERS[(i + 3) % NUMBERS.length] + ' Angles to Test'; },
      function (i) { return 'Can a Better ' + keyword + ' Really Drive ' + smartCase(outcome) + '?'; },
      function (i) { return keyword + ' Swipe File: ' + pack.power[i % pack.power.length] + ' Openers for ' + audience; },
      function (i) { return 'From Weak to Clickable: Rewriting Your ' + keyword; },
      function (i) { return keyword + ' Ideas for ' + smartCase(topic) + ' That Feel ' + pack.power[i % pack.power.length]; },
      function (i) { return 'The ' + pack.power[i % pack.power.length] + ' ' + keyword + ' Playbook for ' + formatLabel; },
    ];
  }

  function dedupeTitles(list) {
    const seen = new Set();
    const output = [];
    list.forEach(function (item) {
      const marker = item.toLowerCase();
      if (seen.has(marker)) {
        return;
      }
      seen.add(marker);
      output.push(item);
    });
    return output;
  }

  function generateTitleIdeas(input) {
    const options = normalizeOptions(input || {});
    const templates = buildTemplates(options);
    const candidates = [];

    for (let round = 0; round < 3; round += 1) {
      for (let index = 0; index < templates.length; index += 1) {
        candidates.push(compactSpace(templates[index](index + round)));
      }
    }

    const unique = dedupeTitles(candidates).slice(0, options.count);
    return unique.map(function (title, index) {
      const metrics = scoreTitle(title);
      return {
        id: index + 1,
        title: title,
        charCount: metrics.charCount,
        score: metrics.score,
        verdict: metrics.verdict,
        keywordFirst: title.toLowerCase().startsWith(options.primaryKeyword.toLowerCase()),
      };
    });
  }

  function copyText(text) {
    if (typeof navigator === 'undefined' || !navigator.clipboard || !navigator.clipboard.writeText) {
      return Promise.reject(new Error('Clipboard API unavailable'));
    }
    return navigator.clipboard.writeText(text);
  }

  function verdictLabel(verdict) {
    if (verdict === 'strong') return 'Strong';
    if (verdict === 'needs-trim') return 'Trim';
    return 'Okay';
  }

  function renderResults(state, refs) {
    const rows = state.results;
    refs.empty.classList.toggle('hidden', rows.length > 0);
    refs.results.innerHTML = rows.map(function (row) {
      return '<article class="idea-card">' +
        '<div class="idea-head">' +
          '<span class="idea-rank">#' + row.id + '</span>' +
          '<button type="button" class="copy-btn" data-copy="' + String(row.id) + '">Copy</button>' +
        '</div>' +
        '<div class="idea-title">' + escapeHtml(row.title) + '</div>' +
        '<div class="idea-meta">' +
          '<span>' + row.charCount + ' chars</span>' +
          '<span>Score ' + row.score + '</span>' +
          '<span>' + verdictLabel(row.verdict) + '</span>' +
          '<span>' + (row.keywordFirst ? 'Keyword-first' : 'Keyword-inside') + '</span>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initBrowser() {
    if (typeof document === 'undefined') {
      return;
    }

    const refs = {
      topic: document.getElementById('topic'),
      primaryKeyword: document.getElementById('primaryKeyword'),
      audience: document.getElementById('audience'),
      outcome: document.getElementById('outcome'),
      tone: document.getElementById('tone'),
      format: document.getElementById('format'),
      count: document.getElementById('count'),
      generate: document.getElementById('generateBtn'),
      copyAll: document.getElementById('copyAllBtn'),
      status: document.getElementById('statusLine'),
      results: document.getElementById('resultsGrid'),
      empty: document.getElementById('emptyState'),
    };

    if (!refs.generate || !refs.results) {
      return;
    }

    const state = { results: [] };

    function readForm() {
      return {
        topic: refs.topic.value,
        primaryKeyword: refs.primaryKeyword.value,
        audience: refs.audience.value,
        outcome: refs.outcome.value,
        tone: refs.tone.value,
        format: refs.format.value,
        count: refs.count.value,
      };
    }

    function setStatus(message, isError) {
      refs.status.textContent = message;
      refs.status.classList.toggle('error', Boolean(isError));
    }

    function generate() {
      state.results = generateTitleIdeas(readForm());
      renderResults(state, refs);
      setStatus('Generated ' + state.results.length + ' deterministic title ideas.', false);
    }

    refs.generate.addEventListener('click', generate);
    refs.copyAll.addEventListener('click', function () {
      if (!state.results.length) {
        setStatus('Generate ideas first.', true);
        return;
      }
      const payload = state.results.map(function (row) { return row.id + '. ' + row.title; }).join('\n');
      copyText(payload)
        .then(function () {
          setStatus('Copied all title ideas.', false);
        })
        .catch(function () {
          setStatus('Clipboard permission failed. Copy manually.', true);
        });
    });

    refs.results.addEventListener('click', function (event) {
      const button = event.target.closest('button[data-copy]');
      if (!button) return;
      const id = Number(button.getAttribute('data-copy'));
      const row = state.results.find(function (item) { return item.id === id; });
      if (!row) return;
      copyText(row.title)
        .then(function () {
          setStatus('Copied #' + id + '.', false);
        })
        .catch(function () {
          setStatus('Clipboard permission failed. Copy manually.', true);
        });
    });

    refs.topic.value = DEFAULTS.topic;
    refs.primaryKeyword.value = DEFAULTS.primaryKeyword;
    refs.audience.value = DEFAULTS.audience;
    refs.outcome.value = DEFAULTS.outcome;
    refs.tone.value = DEFAULTS.tone;
    refs.format.value = DEFAULTS.format;
    refs.count.value = String(DEFAULTS.count);
    generate();
  }

  return {
    DEFAULTS: DEFAULTS,
    smartCase: smartCase,
    normalizeOptions: normalizeOptions,
    scoreTitle: scoreTitle,
    generateTitleIdeas: generateTitleIdeas,
    initBrowser: initBrowser,
  };
});
