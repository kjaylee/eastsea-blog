(function (root) {
  'use strict';

  /**
   * Parse a URL string into its components.
   * @param {string} urlString
   * @returns {object}
   */
  function parseURL(urlString) {
    if (!urlString || !urlString.trim()) {
      return { valid: false, error: 'Empty input' };
    }
    try {
      const url = new URL(urlString.trim());
      const params = [];
      url.searchParams.forEach(function (value, key) {
        params.push({
          key: key,
          value: value,
          decodedKey: safeDecodeComponent(key),
          decodedValue: safeDecodeComponent(value)
        });
      });
      return {
        valid: true,
        protocol: url.protocol.replace(':', ''),
        username: url.username || null,
        password: url.password || null,
        host: url.host,
        hostname: url.hostname,
        port: url.port || null,
        pathname: url.pathname,
        search: url.search,
        searchParams: params,
        hash: url.hash ? url.hash.slice(1) : null,
        href: url.href,
        origin: url.origin,
        error: null
      };
    } catch (e) {
      return { valid: false, error: e.message };
    }
  }

  /**
   * Safely decode a percent-encoded string.
   * Handles both decodeURIComponent and decodeURI fallback.
   * @param {string} str
   * @returns {{ result: string, error: string|null }}
   */
  function decodeString(str) {
    if (str === null || str === undefined) return { result: '', error: null };
    const s = String(str);
    if (!s) return { result: '', error: null };
    // Replace + with space first (form encoding)
    const withSpaces = s.replace(/\+/g, ' ');
    try {
      return { result: decodeURIComponent(withSpaces), error: null };
    } catch (e) {
      try {
        return { result: decodeURI(s), error: null };
      } catch (e2) {
        return { result: s, error: e2.message };
      }
    }
  }

  /**
   * Internal helper: safe decode without throwing.
   */
  function safeDecodeComponent(str) {
    return decodeString(str).result;
  }

  /**
   * Bulk decode multiple lines of text.
   * @param {string} text - newline-separated list of encoded strings
   * @returns {Array<{index, original, decoded, changed, error}>}
   */
  function bulkDecode(text) {
    if (!text) return [];
    const lines = text.split('\n');
    return lines.map(function (line, i) {
      const trimmed = line.trim();
      if (!trimmed) {
        return { index: i, original: line, decoded: '', changed: false, error: null };
      }
      const r = decodeString(trimmed);
      return {
        index: i,
        original: trimmed,
        decoded: r.result,
        changed: r.result !== trimmed,
        error: r.error
      };
    });
  }

  /**
   * Extract all query parameters from a URL or query string.
   * @param {string} input
   * @returns {Array<{key, value, decodedKey, decodedValue}>}
   */
  function parseQueryString(input) {
    if (!input) return [];
    let qs = input.trim();
    // Strip leading ? or full URL
    if (qs.includes('?')) {
      qs = qs.slice(qs.indexOf('?') + 1);
    }
    if (qs.includes('#')) {
      qs = qs.slice(0, qs.indexOf('#'));
    }
    const params = new URLSearchParams(qs);
    const result = [];
    params.forEach(function (value, key) {
      result.push({
        key: key,
        value: value,
        decodedKey: safeDecodeComponent(key),
        decodedValue: safeDecodeComponent(value)
      });
    });
    return result;
  }

  var exports = {
    parseURL: parseURL,
    decodeString: decodeString,
    bulkDecode: bulkDecode,
    parseQueryString: parseQueryString
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports;
  } else {
    root.URLDecoderCalc = exports;
  }
}(typeof globalThis !== 'undefined' ? globalThis : this));
