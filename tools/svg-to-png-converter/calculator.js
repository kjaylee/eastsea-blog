(function (root) {
  'use strict';

  /**
   * Parse width/height from SVG string.
   * @param {string} svgString
   * @returns {{ width: number|null, height: number|null, viewBox: string|null }}
   */
  function parseSVGDimensions(svgString) {
    if (!svgString) return { width: null, height: null, viewBox: null };

    var widthMatch = svgString.match(/\bwidth=["']([^"']+)["']/i);
    var heightMatch = svgString.match(/\bheight=["']([^"']+)["']/i);
    var viewBoxMatch = svgString.match(/\bviewBox=["']([^"']+)["']/i);

    var w = null, h = null;

    if (widthMatch) {
      var wv = parseFloat(widthMatch[1]);
      if (!isNaN(wv)) w = wv;
    }
    if (heightMatch) {
      var hv = parseFloat(heightMatch[1]);
      if (!isNaN(hv)) h = hv;
    }

    // Try viewBox if no explicit dimensions
    var vb = viewBoxMatch ? viewBoxMatch[1] : null;
    if (vb && (w === null || h === null)) {
      var parts = vb.trim().split(/[\s,]+/);
      if (parts.length >= 4) {
        var vbW = parseFloat(parts[2]);
        var vbH = parseFloat(parts[3]);
        if (!isNaN(vbW) && w === null) w = vbW;
        if (!isNaN(vbH) && h === null) h = vbH;
      }
    }

    return { width: w, height: h, viewBox: vb };
  }

  /**
   * Get aspect ratio from dimensions.
   * @param {number} w
   * @param {number} h
   * @returns {number}
   */
  function getAspectRatio(w, h) {
    if (!w || !h) return 1;
    return w / h;
  }

  /**
   * Validate SVG string — checks it starts with <svg.
   * @param {string} svgString
   * @returns {{ valid: boolean, error: string|null }}
   */
  function validateSVG(svgString) {
    if (!svgString || !svgString.trim()) {
      return { valid: false, error: 'Empty input' };
    }
    var trimmed = svgString.trim();
    // Allow XML declaration or DOCTYPE before <svg
    var stripped = trimmed.replace(/^<\?xml[^>]*\?>\s*/i, '').replace(/^<!DOCTYPE[^>]*>\s*/i, '');
    if (!/<svg[\s>]/i.test(stripped)) {
      return { valid: false, error: 'Not a valid SVG: must contain <svg> element' };
    }
    return { valid: true, error: null };
  }

  /**
   * Convert SVG string to PNG data URL using canvas.
   * Returns a Promise resolving to { dataUrl, width, height } or rejecting with error.
   * @param {string} svgString
   * @param {number} outWidth - desired output width in px
   * @param {number} outHeight - desired output height in px
   * @param {string|null} bgColor - CSS color or null for transparent
   * @returns {Promise<{dataUrl: string, width: number, height: number}>}
   */
  function svgToPng(svgString, outWidth, outHeight, bgColor) {
    return new Promise(function (resolve, reject) {
      var validation = validateSVG(svgString);
      if (!validation.valid) {
        reject(new Error(validation.error));
        return;
      }

      var w = Math.round(outWidth) || 512;
      var h = Math.round(outHeight) || 512;

      // Ensure SVG has width/height set to desired output
      var svgWithSize = svgString.trim();
      // Inject width/height attributes into <svg> tag
      svgWithSize = svgWithSize.replace(/<svg(\s)/i, '<svg width="' + w + '" height="' + h + '"$1');
      svgWithSize = svgWithSize.replace(/<svg>/i, '<svg width="' + w + '" height="' + h + '">');

      var blob = new Blob([svgWithSize], { type: 'image/svg+xml;charset=utf-8' });
      var url = URL.createObjectURL(blob);

      var img = new Image();
      img.onload = function () {
        try {
          var canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          var ctx = canvas.getContext('2d');

          if (bgColor) {
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, w, h);
          }

          ctx.drawImage(img, 0, 0, w, h);
          URL.revokeObjectURL(url);

          var dataUrl = canvas.toDataURL('image/png');
          resolve({ dataUrl: dataUrl, width: w, height: h });
        } catch (e) {
          URL.revokeObjectURL(url);
          reject(e);
        }
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to render SVG. Check SVG validity.'));
      };
      img.src = url;
    });
  }

  /**
   * Trigger a PNG download from a data URL.
   * @param {string} dataUrl
   * @param {string} filename
   */
  function downloadPng(dataUrl, filename) {
    var a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename || 'converted.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  var exports = {
    parseSVGDimensions: parseSVGDimensions,
    getAspectRatio: getAspectRatio,
    validateSVG: validateSVG,
    svgToPng: svgToPng,
    downloadPng: downloadPng
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports;
  } else {
    root.SVGConverterCalc = exports;
  }
}(typeof globalThis !== 'undefined' ? globalThis : this));
