(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AppStoreScreenshotChecklist = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  const STORAGE_KEY = 'eastsea-app-store-screenshot-qa-checklist-v1';

  const CHECKLIST = [
    {
      section: 'Required assets',
      items: [
        {
          id: 'iphone-set-ready',
          label: 'Prepared the practical iPhone base set (6.9\" or 6.5\")',
          detail: 'You have the actual iPhone screenshot set ready for the primary phone class.',
          critical: true,
          weight: 12,
        },
        {
          id: 'counts-valid',
          label: 'Screenshot counts per device / locale are inside Apple’s 1–10 range',
          detail: 'Avoid upload surprises by validating the intended count before release day.',
          critical: true,
          weight: 8,
        },
        {
          id: 'formats-valid',
          label: 'Files are PNG/JPG/JPEG and each screenshot is under 8MB',
          detail: 'This MVP does not upload-validate; it helps you confirm the release checklist manually.',
          critical: true,
          weight: 8,
        },
        {
          id: 'ipad-set-ready',
          label: 'Prepared the required 13\" iPad set because the app supports iPad',
          detail: 'Only applicable when the release includes iPad support.',
          critical: true,
          weight: 10,
          when: function when(config) { return !!config.supportsIpad; },
        },
      ],
    },
    {
      section: 'Conversion & messaging',
      items: [
        {
          id: 'first-three-story',
          label: 'The first three screenshots clearly tell the product story',
          detail: 'A user should understand the core value without reading the rest of the listing.',
          critical: false,
          weight: 8,
        },
        {
          id: 'one-message-per-screen',
          label: 'Each screenshot focuses on one message, not five competing claims',
          detail: 'One benefit per frame tends to read better than crowded caption stacks.',
          critical: false,
          weight: 6,
        },
        {
          id: 'text-legible',
          label: 'Headline text is legible on a real phone-sized preview',
          detail: 'If it cannot be read on-device, it will not convert.',
          critical: false,
          weight: 7,
        },
        {
          id: 'feature-proof',
          label: 'Visuals show real features or outcomes instead of decorative filler',
          detail: 'Every frame should earn its place.',
          critical: false,
          weight: 5,
        },
      ],
    },
    {
      section: 'Policy & honesty',
      items: [
        {
          id: 'honest-ui',
          label: 'Screenshots reflect the current in-app UI and supported features',
          detail: 'No speculative features, fake rankings, or future-only UI.',
          critical: true,
          weight: 8,
        },
        {
          id: 'claims-safe',
          label: 'No risky claims (pricing, rankings, guarantees, unsupported promises)',
          detail: 'Keep copy defensible and review-safe.',
          critical: true,
          weight: 7,
        },
      ],
    },
    {
      section: 'Localization & consistency',
      items: [
        {
          id: 'localized-copy-reviewed',
          label: 'Localized captions were reviewed, not just machine-dumped',
          detail: 'Only applicable when more than one language is being shipped.',
          critical: true,
          weight: 7,
          when: function when(config) { return Number(config.languagesCount) > 1; },
        },
        {
          id: 'visual-consistency',
          label: 'Layouts, crop rules, and visual hierarchy stay consistent across locales',
          detail: 'Avoid one-off spacing or overflow bugs in translated sets.',
          critical: false,
          weight: 5,
          when: function when(config) { return Number(config.languagesCount) > 1; },
        },
      ],
    },
    {
      section: 'Release ops',
      items: [
        {
          id: 'source-files-organized',
          label: 'Source files / exports are organized for the next update',
          detail: 'A tidy source package reduces the cost of the next release.',
          critical: false,
          weight: 3,
        },
        {
          id: 'upload-order-ready',
          label: 'Upload order and locale mapping are finalized before release day',
          detail: 'Know which locale gets which set before you open App Store Connect.',
          critical: false,
          weight: 3,
        },
        {
          id: 'stakeholder-review',
          label: 'Design / PM / founder sign-off happened before upload',
          detail: 'Prevent last-minute caption debates in App Store Connect.',
          critical: false,
          weight: 3,
        },
      ],
    },
  ];

  const SAMPLE_STATE = {
    config: {
      appName: 'FocusFrame Camera',
      languagesCount: 3,
      iphoneScreenshots: 5,
      supportsIpad: true,
      ipadScreenshots: 4,
      notes: 'Need final Korean/Japanese caption pass before upload.',
    },
    checked: {
      'iphone-set-ready': true,
      'counts-valid': true,
      'formats-valid': true,
      'ipad-set-ready': false,
      'first-three-story': true,
      'one-message-per-screen': true,
      'text-legible': true,
      'feature-proof': true,
      'honest-ui': true,
      'claims-safe': true,
      'localized-copy-reviewed': false,
      'visual-consistency': true,
      'source-files-organized': true,
      'upload-order-ready': false,
      'stakeholder-review': false,
    },
  };

  function toInt(value, fallback) {
    const num = Number.parseInt(value, 10);
    return Number.isFinite(num) ? num : fallback;
  }

  function normalizeConfig(raw) {
    const input = raw || {};
    return {
      appName: String(input.appName || 'Untitled app').trim() || 'Untitled app',
      languagesCount: toInt(input.languagesCount, 1),
      iphoneScreenshots: toInt(input.iphoneScreenshots, 5),
      supportsIpad: !!input.supportsIpad,
      ipadScreenshots: toInt(input.ipadScreenshots, 0),
      notes: String(input.notes || '').trim(),
    };
  }

  function validateConfig(raw) {
    const config = normalizeConfig(raw);
    const errors = [];

    if (config.languagesCount < 1 || config.languagesCount > 30) {
      errors.push('Languages must be between 1 and 30.');
    }
    if (config.iphoneScreenshots < 1 || config.iphoneScreenshots > 10) {
      errors.push('iPhone screenshots per locale must be between 1 and 10.');
    }
    if (config.supportsIpad && (config.ipadScreenshots < 1 || config.ipadScreenshots > 10)) {
      errors.push('iPad screenshots per locale must be between 1 and 10 when iPad support is enabled.');
    }

    return {
      ok: errors.length === 0,
      errors: errors,
      config: config,
    };
  }

  function summarizeRequirements(raw) {
    const validation = validateConfig(raw);
    const config = validation.config;
    const requiredSets = [
      {
        key: 'iphone',
        label: 'iPhone 6.9\" (or 6.5\") base set',
        screenshotsPerLocale: config.iphoneScreenshots,
        required: true,
      },
    ];

    if (config.supportsIpad) {
      requiredSets.push({
        key: 'ipad',
        label: '13\" iPad set',
        screenshotsPerLocale: config.ipadScreenshots,
        required: true,
      });
    }

    const screenshotsPerLocale = requiredSets.reduce(function sum(total, item) {
      return total + item.screenshotsPerLocale;
    }, 0);

    const totalScreenshots = screenshotsPerLocale * config.languagesCount;
    const estimatedUploadMinutes = Math.max(10, Math.round(totalScreenshots * 0.75));

    return {
      config: config,
      validationErrors: validation.errors,
      requiredSets: requiredSets,
      screenshotsPerLocale: screenshotsPerLocale,
      totalScreenshots: totalScreenshots,
      estimatedUploadMinutes: estimatedUploadMinutes,
      locales: config.languagesCount,
    };
  }

  function getApplicableItems(raw) {
    const config = normalizeConfig(raw);
    return CHECKLIST.flatMap(function flatten(section) {
      return section.items
        .filter(function filter(item) {
          return !item.when || item.when(config);
        })
        .map(function map(item) {
          return Object.assign({ section: section.section }, item);
        });
    });
  }

  function computeChecklist(rawConfig, checkedMap) {
    const validation = validateConfig(rawConfig);
    const config = validation.config;
    const checked = checkedMap || {};
    const applicableItems = getApplicableItems(config);
    const totalWeight = applicableItems.reduce(function sum(total, item) {
      return total + item.weight;
    }, 0);
    const completedItems = applicableItems.filter(function filter(item) {
      return !!checked[item.id];
    });
    const completedWeight = completedItems.reduce(function sum(total, item) {
      return total + item.weight;
    }, 0);
    const blockers = applicableItems
      .filter(function filter(item) {
        return item.critical && !checked[item.id];
      })
      .map(function map(item) {
        return {
          id: item.id,
          label: item.label,
          section: item.section,
        };
      });

    const score = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
    let verdict = 'Needs polish';
    if (validation.errors.length > 0 || blockers.length > 0) {
      verdict = 'Blocked';
    } else if (score >= 90) {
      verdict = 'Ready to review';
    }

    return {
      config: config,
      validationErrors: validation.errors,
      applicableItems: applicableItems,
      completedItems: completedItems,
      completedCount: completedItems.length,
      totalCount: applicableItems.length,
      totalWeight: totalWeight,
      completedWeight: completedWeight,
      score: score,
      blockers: blockers,
      blockerCount: blockers.length,
      verdict: verdict,
    };
  }

  function buildMarkdownReport(rawConfig, checkedMap) {
    const summary = summarizeRequirements(rawConfig);
    const checklist = computeChecklist(rawConfig, checkedMap);
    const lines = [
      '# App Store Screenshot QA Checklist Report',
      '',
      '## Setup',
      '',
      '- App: ' + checklist.config.appName,
      '- Languages: ' + checklist.config.languagesCount,
      '- iPhone screenshots per locale: ' + checklist.config.iphoneScreenshots,
      '- iPad support: ' + (checklist.config.supportsIpad ? 'Yes' : 'No'),
      '- iPad screenshots per locale: ' + (checklist.config.supportsIpad ? checklist.config.ipadScreenshots : 'N/A'),
      '',
      '## Requirement summary',
      '',
      '- Required sets: ' + summary.requiredSets.map(function map(item) { return item.label; }).join(', '),
      '- Total screenshots: ' + summary.totalScreenshots,
      '- Estimated upload time: ~' + summary.estimatedUploadMinutes + ' min',
      '',
      '## Readiness',
      '',
      '- Verdict: ' + checklist.verdict,
      '- Score: ' + checklist.score + '/100',
      '- Completed items: ' + checklist.completedCount + '/' + checklist.totalCount,
      '- Blockers: ' + checklist.blockerCount,
      '',
      '## Blockers',
      '',
    ];

    if (checklist.validationErrors.length) {
      checklist.validationErrors.forEach(function each(error) {
        lines.push('- ' + error);
      });
    }
    if (checklist.blockers.length) {
      checklist.blockers.forEach(function each(blocker) {
        lines.push('- [' + blocker.section + '] ' + blocker.label);
      });
    }
    if (!checklist.validationErrors.length && !checklist.blockers.length) {
      lines.push('- None');
    }

    lines.push('', '## Checklist', '');
    checklist.applicableItems.forEach(function each(item) {
      lines.push('- [' + (checkedMap && checkedMap[item.id] ? 'x' : ' ') + '] ' + item.label);
    });

    if (checklist.config.notes) {
      lines.push('', '## Notes', '', checklist.config.notes);
    }

    return lines.join('\n');
  }

  function loadStoredState() {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw);
      return {
        config: normalizeConfig(parsed.config),
        checked: parsed.checked || {},
      };
    } catch (error) {
      return null;
    }
  }

  function saveStoredState(state) {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function createDefaultState() {
    return {
      config: normalizeConfig({
        appName: 'Untitled app',
        languagesCount: 1,
        iphoneScreenshots: 5,
        supportsIpad: false,
        ipadScreenshots: 0,
        notes: '',
      }),
      checked: {},
    };
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

    const dom = {
      appName: document.getElementById('appName'),
      languagesCount: document.getElementById('languagesCount'),
      iphoneScreenshots: document.getElementById('iphoneScreenshots'),
      supportsIpad: document.getElementById('supportsIpad'),
      ipadWrap: document.getElementById('ipadWrap'),
      ipadScreenshots: document.getElementById('ipadScreenshots'),
      notes: document.getElementById('notes'),
      checklist: document.getElementById('checklist'),
      requirements: document.getElementById('requirements'),
      blockers: document.getElementById('blockers'),
      score: document.getElementById('score'),
      verdict: document.getElementById('verdict'),
      meta: document.getElementById('metaStats'),
      report: document.getElementById('reportOutput'),
      error: document.getElementById('errorBox'),
      sampleBtn: document.getElementById('sampleBtn'),
      resetBtn: document.getElementById('resetBtn'),
      exportBtn: document.getElementById('exportBtn'),
      copyBtn: document.getElementById('copyBtn'),
      savePill: document.getElementById('savePill'),
    };

    const state = loadStoredState() || createDefaultState();

    function setPill(text) {
      if (dom.savePill) {
        dom.savePill.textContent = text;
      }
    }

    function readConfigFromInputs() {
      return normalizeConfig({
        appName: dom.appName.value,
        languagesCount: dom.languagesCount.value,
        iphoneScreenshots: dom.iphoneScreenshots.value,
        supportsIpad: dom.supportsIpad.checked,
        ipadScreenshots: dom.ipadScreenshots.value,
        notes: dom.notes.value,
      });
    }

    function syncInputsFromState() {
      dom.appName.value = state.config.appName;
      dom.languagesCount.value = state.config.languagesCount;
      dom.iphoneScreenshots.value = state.config.iphoneScreenshots;
      dom.supportsIpad.checked = !!state.config.supportsIpad;
      dom.ipadScreenshots.value = state.config.supportsIpad ? state.config.ipadScreenshots : 4;
      dom.notes.value = state.config.notes || '';
      dom.ipadWrap.hidden = !state.config.supportsIpad;
    }

    function saveAndRender(pill) {
      state.config = readConfigFromInputs();
      saveStoredState(state);
      render();
      if (pill) {
        setPill(pill);
        setTimeout(function resetPill() {
          setPill('Auto-saved locally');
        }, 900);
      }
    }

    function renderChecklist(config) {
      const applicable = CHECKLIST.map(function mapSection(section) {
        const items = section.items.filter(function filter(item) {
          return !item.when || item.when(config);
        });
        return Object.assign({}, section, { items: items });
      }).filter(function filterSection(section) {
        return section.items.length > 0;
      });

      dom.checklist.innerHTML = applicable.map(function mapSection(section) {
        return '<section class="check-section">'
          + '<div class="section-head"><h3>' + escapeHtml(section.section) + '</h3></div>'
          + section.items.map(function mapItem(item) {
            const checked = !!state.checked[item.id];
            return '<label class="check-item" for="item-' + escapeHtml(item.id) + '">'
              + '<input id="item-' + escapeHtml(item.id) + '" data-item-id="' + escapeHtml(item.id) + '" type="checkbox" ' + (checked ? 'checked' : '') + ' />'
              + '<span class="check-copy">'
              + '<strong>' + escapeHtml(item.label) + '</strong>'
              + '<small>' + escapeHtml(item.detail) + '</small>'
              + '</span>'
              + '<span class="check-badges">'
              + '<span class="mini-tag">' + item.weight + ' pts</span>'
              + (item.critical ? '<span class="mini-tag critical">Critical</span>' : '')
              + '</span>'
              + '</label>';
          }).join('')
          + '</section>';
      }).join('');

      dom.checklist.querySelectorAll('[data-item-id]').forEach(function each(node) {
        node.addEventListener('change', function onChange(event) {
          state.checked[event.target.getAttribute('data-item-id')] = event.target.checked;
          saveAndRender('Checklist updated');
        });
      });
    }

    function renderRequirements(summary) {
      dom.requirements.innerHTML = summary.requiredSets.map(function map(item) {
        return '<div class="requirement-card">'
          + '<div class="requirement-label">Required set</div>'
          + '<div class="requirement-title">' + escapeHtml(item.label) + '</div>'
          + '<div class="requirement-meta">' + item.screenshotsPerLocale + ' shots / locale</div>'
          + '</div>';
      }).join('')
      + '<div class="requirement-card accent">'
      + '<div class="requirement-label">Workload</div>'
      + '<div class="requirement-title">' + summary.totalScreenshots + ' total screenshots</div>'
      + '<div class="requirement-meta">~' + summary.estimatedUploadMinutes + ' min upload / review prep</div>'
      + '</div>';
    }

    function renderBlockers(result) {
      const items = [];
      result.validationErrors.forEach(function each(error) {
        items.push('<li>' + escapeHtml(error) + '</li>');
      });
      result.blockers.forEach(function each(blocker) {
        items.push('<li><strong>' + escapeHtml(blocker.section) + ':</strong> ' + escapeHtml(blocker.label) + '</li>');
      });
      if (!items.length) {
        items.push('<li>No critical blockers. This set is safe to move into final review.</li>');
      }
      dom.blockers.innerHTML = items.join('');
    }

    function render() {
      const config = state.config;
      dom.ipadWrap.hidden = !config.supportsIpad;
      renderChecklist(config);

      const summary = summarizeRequirements(config);
      const result = computeChecklist(config, state.checked);
      const markdown = buildMarkdownReport(config, state.checked);

      renderRequirements(summary);
      renderBlockers(result);
      dom.score.textContent = result.score;
      dom.verdict.textContent = result.verdict;
      dom.verdict.className = 'verdict ' + (result.verdict === 'Ready to review' ? 'good' : result.verdict === 'Blocked' ? 'bad' : 'warn');
      dom.meta.innerHTML = '<div><span>Completed</span><strong>' + result.completedCount + '/' + result.totalCount + '</strong></div>'
        + '<div><span>Blockers</span><strong>' + result.blockerCount + '</strong></div>'
        + '<div><span>Locales</span><strong>' + summary.locales + '</strong></div>';
      dom.report.value = markdown;

      if (summary.validationErrors.length) {
        dom.error.hidden = false;
        dom.error.textContent = summary.validationErrors.join(' ');
      } else {
        dom.error.hidden = true;
        dom.error.textContent = '';
      }
    }

    syncInputsFromState();
    render();

    [dom.appName, dom.languagesCount, dom.iphoneScreenshots, dom.ipadScreenshots, dom.notes].forEach(function each(node) {
      node.addEventListener('input', function onInput() {
        saveAndRender('Fields updated');
      });
    });

    dom.supportsIpad.addEventListener('change', function onToggle() {
      dom.ipadWrap.hidden = !dom.supportsIpad.checked;
      saveAndRender('Device scope updated');
    });

    dom.sampleBtn.addEventListener('click', function onSample() {
      state.config = normalizeConfig(SAMPLE_STATE.config);
      state.checked = Object.assign({}, SAMPLE_STATE.checked);
      syncInputsFromState();
      saveStoredState(state);
      render();
      setPill('Sample loaded');
    });

    dom.resetBtn.addEventListener('click', function onReset() {
      const empty = createDefaultState();
      state.config = empty.config;
      state.checked = empty.checked;
      syncInputsFromState();
      saveStoredState(state);
      render();
      setPill('Reset complete');
    });

    dom.exportBtn.addEventListener('click', function onExport() {
      dom.report.value = buildMarkdownReport(state.config, state.checked);
      dom.report.focus();
      dom.report.select();
      setPill('Report refreshed');
    });

    dom.copyBtn.addEventListener('click', function onCopy() {
      const text = dom.report.value;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function success() {
          setPill('Copied');
        }, function fail() {
          setPill('Copy failed');
        });
      } else {
        dom.report.focus();
        dom.report.select();
        setPill('Select + copy manually');
      }
    });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initBrowser);
    } else {
      initBrowser();
    }
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    CHECKLIST: CHECKLIST,
    SAMPLE_STATE: SAMPLE_STATE,
    normalizeConfig: normalizeConfig,
    validateConfig: validateConfig,
    summarizeRequirements: summarizeRequirements,
    getApplicableItems: getApplicableItems,
    computeChecklist: computeChecklist,
    buildMarkdownReport: buildMarkdownReport,
  };
}));
