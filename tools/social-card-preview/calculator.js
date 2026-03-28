(function (root) {
  'use strict';

  var LIMITS = {
    twitter: {
      title: 70,
      description: 200,
      imageAspect: '2:1',
      imageSize: '1200x628',
      urlMaxDisplay: 30
    },
    facebook: {
      title: 100,
      description: 300,
      imageAspect: '1.91:1',
      imageSize: '1200x630',
      urlMaxDisplay: 40
    },
    linkedin: {
      title: 150,
      description: 300,
      imageAspect: '1.91:1',
      imageSize: '1200x627',
      urlMaxDisplay: 40
    }
  };

  /**
   * Truncate text to maxLen, adding ellipsis if needed.
   */
  function truncate(text, maxLen) {
    if (!text) return '';
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen - 1) + '…';
  }

  /**
   * Extract domain from URL for display.
   */
  function extractDomain(url) {
    if (!url) return '';
    try {
      var u = new URL(url.trim());
      return u.hostname.replace(/^www\./, '');
    } catch (e) {
      // fallback: strip protocol
      return url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0].split('?')[0];
    }
  }

  /**
   * Check character limits and return warnings for all platforms.
   * @param {string} title
   * @param {string} description
   * @param {string} pageUrl
   * @returns {object} warnings per platform
   */
  function checkLimits(title, description, pageUrl) {
    var result = {};
    var titleLen = (title || '').length;
    var descLen = (description || '').length;

    Object.keys(LIMITS).forEach(function (platform) {
      var lim = LIMITS[platform];
      var warnings = [];
      var info = [];

      if (titleLen > lim.title) {
        warnings.push('Title too long: ' + titleLen + '/' + lim.title + ' chars (will be truncated)');
      } else {
        info.push('Title: ' + titleLen + '/' + lim.title + ' chars');
      }

      if (descLen > lim.description) {
        warnings.push('Description too long: ' + descLen + '/' + lim.description + ' chars (will be truncated)');
      } else {
        info.push('Description: ' + descLen + '/' + lim.description + ' chars');
      }

      result[platform] = {
        titleLen: titleLen,
        descLen: descLen,
        titleLimit: lim.title,
        descLimit: lim.description,
        titleTruncated: titleLen > lim.title,
        descTruncated: descLen > lim.description,
        titleDisplay: truncate(title, lim.title),
        descDisplay: truncate(description, lim.description),
        domain: extractDomain(pageUrl),
        warnings: warnings,
        info: info
      };
    });

    return result;
  }

  /**
   * Generate preview data for a single platform.
   */
  function getPreviewData(platform, title, description, imageUrl, pageUrl) {
    var lim = LIMITS[platform];
    if (!lim) return null;
    return {
      platform: platform,
      title: truncate(title || 'No title', lim.title),
      description: truncate(description || '', lim.description),
      imageUrl: imageUrl || '',
      domain: extractDomain(pageUrl),
      url: pageUrl || '',
      imageSize: lim.imageSize,
      imageAspect: lim.imageAspect,
      titleLen: (title || '').length,
      descLen: (description || '').length,
      titleLimit: lim.title,
      descLimit: lim.description,
      titleTruncated: (title || '').length > lim.title,
      descTruncated: (description || '').length > lim.description
    };
  }

  var exports = {
    LIMITS: LIMITS,
    truncate: truncate,
    extractDomain: extractDomain,
    checkLimits: checkLimits,
    getPreviewData: getPreviewData
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports;
  } else {
    root.SocialCardCalc = exports;
  }
}(typeof globalThis !== 'undefined' ? globalThis : this));
