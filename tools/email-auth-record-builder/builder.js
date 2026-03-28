(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  root.EmailAuthRecordBuilder = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const PROVIDERS = [
    { id: 'google-workspace', label: 'Google Workspace', include: '_spf.google.com' },
    { id: 'microsoft-365', label: 'Microsoft 365', include: 'spf.protection.outlook.com' },
    { id: 'sendgrid', label: 'SendGrid', include: 'sendgrid.net' },
    { id: 'mailchimp', label: 'Mailchimp', include: 'servers.mcsv.net' },
    { id: 'amazon-ses', label: 'Amazon SES', include: 'amazonses.com' },
    { id: 'postmark', label: 'Postmark', include: 'spf.mtasv.net' },
    { id: 'zoho', label: 'Zoho Mail', include: 'spf.zoho.com' },
  ];

  const PROVIDER_LOOKUP = PROVIDERS.reduce(function (acc, provider) {
    acc[provider.id] = provider;
    return acc;
  }, {});

  const DEFAULT_STATE = {
    domain: '',
    selectedProviders: [],
    includeA: false,
    includeMx: false,
    customIncludes: '',
    ip4: '',
    ip6: '',
    redirect: '',
    allMode: '~all',
    dmarcPolicy: 'none',
    dmarcSubdomainPolicy: '',
    dmarcRua: '',
    dmarcRuf: '',
    dmarcPct: '100',
    dmarcAdkim: 'r',
    dmarcAspf: 'r',
    dmarcFo: '0',
    dmarcRi: '',
  };

  function cloneDefaultState() {
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  function uniquePreserveOrder(values) {
    const seen = new Set();
    const result = [];
    values.forEach(function (value) {
      const next = String(value == null ? '' : value).trim();
      if (!next) return;
      const key = next.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      result.push(next);
    });
    return result;
  }

  function splitList(value) {
    return String(value == null ? '' : value)
      .split(/[\n,]/)
      .map(function (item) { return item.trim(); })
      .filter(Boolean);
  }

  function cleanDomain(value) {
    return String(value == null ? '' : value)
      .trim()
      .replace(/^https?:\/\//i, '')
      .replace(/^mailto:/i, '')
      .replace(/\/.*$/, '')
      .replace(/^@+/, '')
      .replace(/\.$/, '')
      .toLowerCase();
  }

  function normalizeInclude(value) {
    const input = String(value == null ? '' : value).trim();
    if (!input) return '';
    if (/^include:/i.test(input)) {
      return input.replace(/^include:/i, '').trim().toLowerCase();
    }
    return cleanDomain(input);
  }

  function normalizeIpToken(value, prefix) {
    const input = String(value == null ? '' : value).trim();
    if (!input) return '';
    const normalizedPrefix = prefix + ':';
    if (input.toLowerCase().startsWith(normalizedPrefix)) {
      return input.slice(normalizedPrefix.length).trim();
    }
    return input;
  }

  function normalizeRedirect(value) {
    const input = String(value == null ? '' : value).trim();
    if (!input) return '';
    if (/^redirect=/i.test(input)) {
      return input.replace(/^redirect=/i, '').trim().toLowerCase();
    }
    return cleanDomain(input);
  }

  function splitMailtoList(value) {
    return uniquePreserveOrder(splitList(value).map(function (item) {
      return item.trim();
    }));
  }

  function splitTxtChunks(value, maxLength) {
    const limit = Number(maxLength) > 0 ? Number(maxLength) : 255;
    const text = String(value == null ? '' : value);
    if (!text) return [];
    if (text.length <= limit) return [text];

    const tokens = text.split(' ');
    const chunks = [];
    let current = '';

    tokens.forEach(function (token) {
      const next = current ? current + ' ' + token : token;
      if (next.length <= limit) {
        current = next;
        return;
      }
      if (current) {
        chunks.push(current);
      }
      if (token.length <= limit) {
        current = token;
        return;
      }
      for (let index = 0; index < token.length; index += limit) {
        const slice = token.slice(index, index + limit);
        if (slice.length === limit || index + limit < token.length) {
          chunks.push(slice);
          current = '';
        } else {
          current = slice;
        }
      }
    });

    if (current) {
      chunks.push(current);
    }
    return chunks;
  }

  function formatQuotedChunks(chunks) {
    return chunks.map(function (chunk) { return '"' + chunk + '"'; }).join(' ');
  }

  function deriveProviderIncludes(selectedProviderIds) {
    return uniquePreserveOrder((selectedProviderIds || []).map(function (providerId) {
      return PROVIDER_LOOKUP[providerId] ? PROVIDER_LOOKUP[providerId].include : '';
    }));
  }

  function buildSpf(rawInput) {
    const input = Object.assign(cloneDefaultState(), rawInput || {});
    const warnings = [];
    const errors = [];
    const providerIncludes = deriveProviderIncludes(input.selectedProviders);
    const customIncludes = uniquePreserveOrder(splitList(input.customIncludes).map(normalizeInclude));
    const includes = uniquePreserveOrder(providerIncludes.concat(customIncludes));
    const ip4Entries = uniquePreserveOrder(splitList(input.ip4).map(function (item) { return normalizeIpToken(item, 'ip4'); }));
    const ip6Entries = uniquePreserveOrder(splitList(input.ip6).map(function (item) { return normalizeIpToken(item, 'ip6'); }));
    const redirect = normalizeRedirect(input.redirect);
    const allMode = ['-all', '~all', '?all', '+all'].indexOf(input.allMode) !== -1 ? input.allMode : '~all';

    const parts = ['v=spf1'];
    if (input.includeA) parts.push('a');
    if (input.includeMx) parts.push('mx');
    includes.forEach(function (includeValue) {
      parts.push('include:' + includeValue);
    });
    ip4Entries.forEach(function (entry) {
      parts.push('ip4:' + entry);
    });
    ip6Entries.forEach(function (entry) {
      parts.push('ip6:' + entry);
    });
    if (redirect) {
      parts.push('redirect=' + redirect);
    }
    parts.push(allMode);

    const value = parts.join(' ');
    const lookupCount = (input.includeA ? 1 : 0) + (input.includeMx ? 1 : 0) + includes.length + (redirect ? 1 : 0);

    if (lookupCount > 10) {
      warnings.push('SPF DNS lookup count is ' + lookupCount + '. SPF allows at most 10 DNS-mechanism lookups.');
    }
    if (value.length > 255) {
      warnings.push('SPF TXT record length exceeds 255 characters. Some DNS providers require quoted multi-string chunks.');
    }
    if ((input.selectedProviders || []).length > 1) {
      warnings.push('Multiple providers selected. Confirm every include is actually authorized to send mail for this domain.');
    }
    if (!includes.length && !input.includeA && !input.includeMx && !ip4Entries.length && !ip6Entries.length && !redirect) {
      warnings.push('SPF currently has no sending sources beyond the final all mechanism.');
    }

    return {
      value: value,
      host: '@',
      type: 'TXT',
      warnings: warnings,
      errors: errors,
      lookupCount: lookupCount,
      length: value.length,
      chunks: splitTxtChunks(value, 255),
      quotedChunkValue: formatQuotedChunks(splitTxtChunks(value, 255)),
      parts: parts,
      includes: includes,
      ip4Entries: ip4Entries,
      ip6Entries: ip6Entries,
      redirect: redirect,
    };
  }

  function validatePct(value) {
    const text = String(value == null ? '' : value).trim();
    if (!text) return { ok: true, numeric: null };
    if (!/^\d+$/.test(text)) return { ok: false, numeric: null };
    const numeric = Number(text);
    if (!Number.isFinite(numeric) || numeric < 0 || numeric > 100) {
      return { ok: false, numeric: numeric };
    }
    return { ok: true, numeric: numeric };
  }

  function validateRi(value) {
    const text = String(value == null ? '' : value).trim();
    if (!text) return { ok: true, numeric: null };
    if (!/^\d+$/.test(text)) return { ok: false, numeric: null };
    const numeric = Number(text);
    if (!Number.isFinite(numeric) || numeric < 0) {
      return { ok: false, numeric: numeric };
    }
    return { ok: true, numeric: numeric };
  }

  function buildDmarc(rawInput) {
    const input = Object.assign(cloneDefaultState(), rawInput || {});
    const warnings = [];
    const errors = [];
    const tags = ['v=DMARC1'];
    const policy = ['none', 'quarantine', 'reject'].indexOf(input.dmarcPolicy) !== -1 ? input.dmarcPolicy : 'none';
    const subdomainPolicy = ['none', 'quarantine', 'reject'].indexOf(input.dmarcSubdomainPolicy) !== -1 ? input.dmarcSubdomainPolicy : '';
    const pctValidation = validatePct(input.dmarcPct);
    const riValidation = validateRi(input.dmarcRi);
    const ruaEntries = splitMailtoList(input.dmarcRua);
    const rufEntries = splitMailtoList(input.dmarcRuf);
    const adkim = ['r', 's'].indexOf(input.dmarcAdkim) !== -1 ? input.dmarcAdkim : 'r';
    const aspf = ['r', 's'].indexOf(input.dmarcAspf) !== -1 ? input.dmarcAspf : 'r';
    const fo = String(input.dmarcFo == null ? '' : input.dmarcFo).trim() || '0';

    tags.push('p=' + policy);
    if (subdomainPolicy) tags.push('sp=' + subdomainPolicy);
    if (String(input.dmarcPct).trim() !== '') tags.push('pct=' + String(input.dmarcPct).trim());
    if (ruaEntries.length) tags.push('rua=' + ruaEntries.join(','));
    if (rufEntries.length) tags.push('ruf=' + rufEntries.join(','));
    tags.push('adkim=' + adkim);
    tags.push('aspf=' + aspf);
    tags.push('fo=' + fo);
    if (String(input.dmarcRi).trim() !== '') tags.push('ri=' + String(input.dmarcRi).trim());

    if (!pctValidation.ok) {
      errors.push('DMARC pct must be 0–100.');
    }
    if (!riValidation.ok) {
      errors.push('DMARC ri must be a non-negative integer.');
    }
    if (!ruaEntries.length) {
      warnings.push('Add a rua mailbox if you want aggregate DMARC reports.');
    }
    ruaEntries.forEach(function (entry) {
      if (!/^mailto:/i.test(entry)) {
        warnings.push('DMARC rua entries must start with mailto:.');
      }
    });
    rufEntries.forEach(function (entry) {
      if (!/^mailto:/i.test(entry)) {
        warnings.push('DMARC ruf entries must start with mailto:.');
      }
    });
    if ((policy === 'quarantine' || policy === 'reject') && !ruaEntries.length) {
      warnings.push('You selected a stricter DMARC policy without an aggregate reporting address.');
    }

    const value = tags.join('; ');
    if (value.length > 255) {
      warnings.push('DMARC TXT record length exceeds 255 characters. Some DNS providers require quoted multi-string chunks.');
    }

    const domain = cleanDomain(input.domain);
    const host = domain ? '_dmarc.' + domain : '_dmarc';

    return {
      value: value,
      host: host,
      type: 'TXT',
      warnings: warnings,
      errors: errors,
      length: value.length,
      chunks: splitTxtChunks(value, 255),
      quotedChunkValue: formatQuotedChunks(splitTxtChunks(value, 255)),
      policy: policy,
      tags: tags,
      ruaEntries: ruaEntries,
      rufEntries: rufEntries,
    };
  }

  function buildAll(rawInput) {
    const input = Object.assign(cloneDefaultState(), rawInput || {});
    const spf = buildSpf(input);
    const dmarc = buildDmarc(input);
    return {
      input: input,
      spf: spf,
      dmarc: dmarc,
      warnings: spf.warnings.concat(dmarc.warnings),
      errors: spf.errors.concat(dmarc.errors),
    };
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatIssueList(items, kind) {
    if (!items.length) {
      return '<li class="issue issue-ok">No ' + kind + '.</li>';
    }
    return items.map(function (item) {
      return '<li class="issue issue-' + kind + '">' + escapeHtml(item) + '</li>';
    }).join('');
  }

  function initBrowser() {
    if (typeof document === 'undefined') return;

    const refs = {
      providerList: document.getElementById('providerList'),
      domain: document.getElementById('domain'),
      includeA: document.getElementById('includeA'),
      includeMx: document.getElementById('includeMx'),
      customIncludes: document.getElementById('customIncludes'),
      ip4: document.getElementById('ip4'),
      ip6: document.getElementById('ip6'),
      redirect: document.getElementById('redirect'),
      allMode: document.getElementById('allMode'),
      dmarcPolicy: document.getElementById('dmarcPolicy'),
      dmarcSubdomainPolicy: document.getElementById('dmarcSubdomainPolicy'),
      dmarcRua: document.getElementById('dmarcRua'),
      dmarcRuf: document.getElementById('dmarcRuf'),
      dmarcPct: document.getElementById('dmarcPct'),
      dmarcAdkim: document.getElementById('dmarcAdkim'),
      dmarcAspf: document.getElementById('dmarcAspf'),
      dmarcFo: document.getElementById('dmarcFo'),
      dmarcRi: document.getElementById('dmarcRi'),
      loadSample: document.getElementById('loadSample'),
      resetForm: document.getElementById('resetForm'),
      spfLookupCount: document.getElementById('spfLookupCount'),
      spfRecordHost: document.getElementById('spfRecordHost'),
      spfOutput: document.getElementById('spfOutput'),
      spfWarnings: document.getElementById('spfWarnings'),
      spfErrors: document.getElementById('spfErrors'),
      spfChunks: document.getElementById('spfChunks'),
      dmarcRecordHost: document.getElementById('dmarcRecordHost'),
      dmarcOutput: document.getElementById('dmarcOutput'),
      dmarcWarnings: document.getElementById('dmarcWarnings'),
      dmarcErrors: document.getElementById('dmarcErrors'),
      dmarcChunks: document.getElementById('dmarcChunks'),
      spfCopy: document.getElementById('copySpf'),
      dmarcCopy: document.getElementById('copyDmarc'),
      helperRuaHint: document.getElementById('helperRuaHint'),
      summaryBanner: document.getElementById('summaryBanner'),
    };

    if (!refs.providerList || !refs.spfOutput || !refs.dmarcOutput) {
      return;
    }

    let state = cloneDefaultState();

    function readStateFromDom() {
      state.domain = refs.domain.value;
      state.includeA = refs.includeA.checked;
      state.includeMx = refs.includeMx.checked;
      state.customIncludes = refs.customIncludes.value;
      state.ip4 = refs.ip4.value;
      state.ip6 = refs.ip6.value;
      state.redirect = refs.redirect.value;
      state.allMode = refs.allMode.value;
      state.dmarcPolicy = refs.dmarcPolicy.value;
      state.dmarcSubdomainPolicy = refs.dmarcSubdomainPolicy.value;
      state.dmarcRua = refs.dmarcRua.value;
      state.dmarcRuf = refs.dmarcRuf.value;
      state.dmarcPct = refs.dmarcPct.value;
      state.dmarcAdkim = refs.dmarcAdkim.value;
      state.dmarcAspf = refs.dmarcAspf.value;
      state.dmarcFo = refs.dmarcFo.value;
      state.dmarcRi = refs.dmarcRi.value;
      state.selectedProviders = Array.from(refs.providerList.querySelectorAll('input[type="checkbox"]:checked')).map(function (input) {
        return input.value;
      });
    }

    function writeStateToDom() {
      refs.domain.value = state.domain;
      refs.includeA.checked = state.includeA;
      refs.includeMx.checked = state.includeMx;
      refs.customIncludes.value = state.customIncludes;
      refs.ip4.value = state.ip4;
      refs.ip6.value = state.ip6;
      refs.redirect.value = state.redirect;
      refs.allMode.value = state.allMode;
      refs.dmarcPolicy.value = state.dmarcPolicy;
      refs.dmarcSubdomainPolicy.value = state.dmarcSubdomainPolicy;
      refs.dmarcRua.value = state.dmarcRua;
      refs.dmarcRuf.value = state.dmarcRuf;
      refs.dmarcPct.value = state.dmarcPct;
      refs.dmarcAdkim.value = state.dmarcAdkim;
      refs.dmarcAspf.value = state.dmarcAspf;
      refs.dmarcFo.value = state.dmarcFo;
      refs.dmarcRi.value = state.dmarcRi;
      Array.from(refs.providerList.querySelectorAll('input[type="checkbox"]')).forEach(function (input) {
        input.checked = state.selectedProviders.indexOf(input.value) !== -1;
      });
    }

    function renderProviders() {
      refs.providerList.innerHTML = PROVIDERS.map(function (provider) {
        return '<label class="preset-chip">' +
          '<input type="checkbox" value="' + provider.id + '" />' +
          '<span><strong>' + escapeHtml(provider.label) + '</strong><small>include:' + escapeHtml(provider.include) + '</small></span>' +
        '</label>';
      }).join('');
    }

    function renderSummary(result) {
      const count = result.spf.lookupCount;
      const providerCount = result.input.selectedProviders.length;
      const lines = [];
      lines.push('SPF lookups: ' + count + '/10');
      if (providerCount) {
        lines.push('Providers selected: ' + providerCount);
      }
      lines.push('DKIM keys/selectors are not generated here.');
      refs.summaryBanner.innerHTML = lines.map(function (line) {
        return '<span class="summary-pill">' + escapeHtml(line) + '</span>';
      }).join('');
      refs.spfLookupCount.textContent = count + ' / 10 DNS lookups';
      refs.spfLookupCount.className = 'lookup-meter' + (count > 10 ? ' is-danger' : count === 10 ? ' is-warn' : '');
    }

    function renderOutput(result) {
      refs.spfRecordHost.textContent = result.spf.host;
      refs.spfOutput.textContent = result.spf.value;
      refs.spfWarnings.innerHTML = formatIssueList(result.spf.warnings, 'warning');
      refs.spfErrors.innerHTML = formatIssueList(result.spf.errors, 'error');
      refs.spfChunks.textContent = result.spf.chunks.length > 1 ? result.spf.quotedChunkValue : 'Single-string TXT record is sufficient.';

      refs.dmarcRecordHost.textContent = result.dmarc.host;
      refs.dmarcOutput.textContent = result.dmarc.value;
      refs.dmarcWarnings.innerHTML = formatIssueList(result.dmarc.warnings, 'warning');
      refs.dmarcErrors.innerHTML = formatIssueList(result.dmarc.errors, 'error');
      refs.dmarcChunks.textContent = result.dmarc.chunks.length > 1 ? result.dmarc.quotedChunkValue : 'Single-string TXT record is sufficient.';

      refs.spfCopy.disabled = result.spf.errors.length > 0;
      refs.dmarcCopy.disabled = result.dmarc.errors.length > 0;
      refs.helperRuaHint.textContent = state.domain
        ? 'Tip: reports often go to mailto:dmarc@' + cleanDomain(state.domain)
        : 'Tip: aggregate reports usually go to a dedicated mailbox such as mailto:dmarc@example.com';
    }

    function render() {
      readStateFromDom();
      const result = buildAll(state);
      renderSummary(result);
      renderOutput(result);
    }

    function copyOutput(type) {
      const result = buildAll(state);
      const payload = type === 'spf' ? result.spf.value : result.dmarc.value;
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        window.alert('Clipboard access is unavailable in this browser.');
        return;
      }
      navigator.clipboard.writeText(payload).then(function () {
        window.alert((type === 'spf' ? 'SPF' : 'DMARC') + ' record copied.');
      }).catch(function () {
        window.alert('Clipboard write failed. Please copy manually.');
      });
    }

    function loadSample() {
      state = Object.assign(cloneDefaultState(), {
        domain: 'example.com',
        selectedProviders: ['google-workspace', 'sendgrid'],
        includeMx: true,
        customIncludes: 'mailgun.org',
        ip4: '203.0.113.0/24',
        allMode: '~all',
        dmarcPolicy: 'quarantine',
        dmarcRua: 'mailto:dmarc@example.com',
        dmarcPct: '100',
        dmarcAdkim: 's',
        dmarcAspf: 's',
        dmarcFo: '1',
      });
      writeStateToDom();
      render();
    }

    function resetForm() {
      state = cloneDefaultState();
      writeStateToDom();
      render();
    }

    renderProviders();
    writeStateToDom();
    render();

    document.addEventListener('input', function () {
      render();
    });
    document.addEventListener('change', function () {
      render();
    });
    refs.loadSample.addEventListener('click', loadSample);
    refs.resetForm.addEventListener('click', resetForm);
    refs.spfCopy.addEventListener('click', function () { copyOutput('spf'); });
    refs.dmarcCopy.addEventListener('click', function () { copyOutput('dmarc'); });
  }

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    window.addEventListener('DOMContentLoaded', initBrowser);
  }

  return {
    PROVIDERS: PROVIDERS,
    PROVIDER_LOOKUP: PROVIDER_LOOKUP,
    DEFAULT_STATE: DEFAULT_STATE,
    cloneDefaultState: cloneDefaultState,
    splitList: splitList,
    cleanDomain: cleanDomain,
    normalizeInclude: normalizeInclude,
    normalizeRedirect: normalizeRedirect,
    splitMailtoList: splitMailtoList,
    splitTxtChunks: splitTxtChunks,
    formatQuotedChunks: formatQuotedChunks,
    buildSpf: buildSpf,
    buildDmarc: buildDmarc,
    buildAll: buildAll,
    initBrowser: initBrowser,
  };
});
