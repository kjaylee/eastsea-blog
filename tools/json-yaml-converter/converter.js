/**
 * JSON ↔ YAML Converter — pure logic
 * Works in both browser (window.jsyaml via CDN) and Node (require/import).
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    // Node / CommonJS
    module.exports = factory(require('js-yaml'));
  } else {
    // Browser: jsyaml loaded via CDN <script>
    root.Converter = factory(root.jsyaml);
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function (jsyaml) {
  'use strict';

  /**
   * Convert a JSON string to YAML.
   * @param {string} jsonStr  Raw JSON input
   * @param {number} [indent=2]  Number of spaces (2 or 4)
   * @returns {{ result: string, error: string|null, errorLine: number|null }}
   */
  function jsonToYaml(jsonStr, indent) {
    indent = indent || 2;
    try {
      var obj = JSON.parse(jsonStr);
      var yaml = jsyaml.dump(obj, {
        indent: indent,
        lineWidth: -1,
        noRefs: true,
        quotingType: '"'
      });
      return { result: yaml, error: null, errorLine: null };
    } catch (e) {
      var lineNum = extractJsonErrorLine(e, jsonStr);
      return { result: '', error: e.message, errorLine: lineNum };
    }
  }

  /**
   * Convert a YAML string to JSON.
   * @param {string} yamlStr  Raw YAML input
   * @param {number} [indent=2]  Number of spaces (2 or 4)
   * @returns {{ result: string, error: string|null, errorLine: number|null }}
   */
  function yamlToJson(yamlStr, indent) {
    indent = indent || 2;
    try {
      var obj = jsyaml.load(yamlStr, { json: true });
      var json = JSON.stringify(obj, null, indent);
      return { result: json, error: null, errorLine: null };
    } catch (e) {
      var lineNum = extractYamlErrorLine(e);
      return { result: '', error: e.message, errorLine: lineNum };
    }
  }

  /**
   * Detect whether a string looks like JSON or YAML.
   * @param {string} str
   * @returns {'json'|'yaml'|'unknown'}
   */
  function detectType(str) {
    var trimmed = (str || '').trim();
    if (!trimmed) return 'unknown';
    if (trimmed.charAt(0) === '{' || trimmed.charAt(0) === '[') return 'json';
    // YAML-style patterns
    if (/^[a-zA-Z_$][a-zA-Z0-9_$]*\s*:/m.test(trimmed)) return 'yaml';
    if (/^---/.test(trimmed)) return 'yaml';
    return 'unknown';
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  function extractJsonErrorLine(err, src) {
    // Modern engines include "at line N" in SyntaxError.message
    var match = err.message.match(/line\s+(\d+)/i);
    if (match) return parseInt(match[1], 10);
    // V8: "at position N"
    var posMatch = err.message.match(/position\s+(\d+)/i);
    if (posMatch) {
      var pos = parseInt(posMatch[1], 10);
      return posToLine(src, pos);
    }
    return null;
  }

  function extractYamlErrorLine(err) {
    if (err.mark && typeof err.mark.line === 'number') {
      return err.mark.line + 1; // js-yaml uses 0-based lines
    }
    var match = (err.message || '').match(/line\s+(\d+)/i);
    return match ? parseInt(match[1], 10) : null;
  }

  function posToLine(src, pos) {
    var lines = src.substring(0, pos).split('\n');
    return lines.length;
  }

  return { jsonToYaml: jsonToYaml, yamlToJson: yamlToJson, detectType: detectType };
}));
