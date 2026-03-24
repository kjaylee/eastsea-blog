#!/usr/bin/env python3
"""Generate a static formula-calculator bundle from tool.config.json."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

REQUIRED_TOP_LEVEL_KEYS = [
    "slug",
    "title",
    "description",
    "headline",
    "subheadline",
    "currencyCode",
    "inputs",
    "formula",
    "summaryLines",
]
REQUIRED_INPUT_KEYS = ["id", "label", "type", "value"]
REQUIRED_SUMMARY_KEYS = ["label", "expr", "format"]
SUPPORTED_INPUT_TYPES = {"number"}
SUPPORTED_FORMATS = {"currency", "percent", "number"}
OUTPUT_FILES = ("index.html", "app.js", "app.test.js")


def read_json(path: Path) -> dict[str, Any]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise ValueError(f"Config file not found: {path}") from exc
    except json.JSONDecodeError as exc:
        raise ValueError(f"Config JSON parse failed: {path} ({exc})") from exc
    if not isinstance(data, dict):
        raise ValueError("Config root must be a JSON object.")
    return data


def validate_config(config: dict[str, Any]) -> dict[str, Any]:
    missing = [key for key in REQUIRED_TOP_LEVEL_KEYS if key not in config]
    if missing:
        raise ValueError(f"Missing required top-level keys: {', '.join(missing)}")

    inputs = config.get("inputs")
    if not isinstance(inputs, list) or not inputs:
        raise ValueError("Config 'inputs' must be a non-empty array.")

    formulas = config.get("formula")
    if not isinstance(formulas, dict) or not formulas:
        raise ValueError("Config 'formula' must be a non-empty object.")

    summary_lines = config.get("summaryLines")
    if not isinstance(summary_lines, list) or not summary_lines:
        raise ValueError("Config 'summaryLines' must be a non-empty array.")

    input_ids: list[str] = []
    for index, field in enumerate(inputs):
        if not isinstance(field, dict):
            raise ValueError(f"Input #{index} must be an object.")
        missing_input_keys = [key for key in REQUIRED_INPUT_KEYS if key not in field]
        if missing_input_keys:
            raise ValueError(f"Input #{index} is missing keys: {', '.join(missing_input_keys)}")
        if field["type"] not in SUPPORTED_INPUT_TYPES:
            raise ValueError(f"Unsupported input type for '{field['id']}': {field['type']}")
        field_id = str(field["id"]).strip()
        if not field_id:
            raise ValueError(f"Input #{index} has an empty id.")
        input_ids.append(field_id)

    duplicates = sorted({field_id for field_id in input_ids if input_ids.count(field_id) > 1})
    if duplicates:
        raise ValueError(f"Duplicate input ids: {', '.join(duplicates)}")

    formula_keys = [str(key).strip() for key in formulas.keys()]
    if any(not key for key in formula_keys):
        raise ValueError("Formula keys must be non-empty strings.")

    for index, item in enumerate(summary_lines):
        if not isinstance(item, dict):
            raise ValueError(f"summaryLines[{index}] must be an object.")
        missing_summary_keys = [key for key in REQUIRED_SUMMARY_KEYS if key not in item]
        if missing_summary_keys:
            raise ValueError(f"summaryLines[{index}] is missing keys: {', '.join(missing_summary_keys)}")
        if item["format"] not in SUPPORTED_FORMATS:
            raise ValueError(f"Unsupported summary format for '{item['label']}': {item['format']}")
        if item["expr"] not in formulas:
            raise ValueError(f"summaryLines[{index}] references unknown expr: {item['expr']}")

    faq = config.get("faq", [])
    if faq is not None:
        if not isinstance(faq, list):
            raise ValueError("Optional 'faq' must be an array when present.")
        for index, item in enumerate(faq):
            if not isinstance(item, dict) or "q" not in item or "a" not in item:
                raise ValueError(f"faq[{index}] must include q and a.")

    return config


def js_string(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False)


def html_escape(value: Any) -> str:
    return (
        str(value)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&#39;")
    )


def render_inputs(config: dict[str, Any]) -> str:
    parts = []
    for field in config["inputs"]:
        attrs = [
            f'id="{html_escape(field["id"])}"',
            f'type="{html_escape(field["type"])}"',
            f'value="{html_escape(field["value"])}"',
        ]
        for key in ("min", "max", "step"):
            if key in field:
                attrs.append(f'{key}="{html_escape(field[key])}"')
        parts.append(
            """
          <div class="field">
            <label for="{id}">{label}</label>
            <input {attrs} />
          </div>""".format(
                id=html_escape(field["id"]),
                label=html_escape(field["label"]),
                attrs=" ".join(attrs),
            )
        )
    return "\n".join(parts)


def render_summary_rows(config: dict[str, Any]) -> str:
    parts = []
    for index, line in enumerate(config["summaryLines"]):
        parts.append(
            f'            <tr><th>{html_escape(line["label"])}</th><td id="summaryRow{index}">—</td></tr>'
        )
    return "\n".join(parts)


def render_faq(config: dict[str, Any]) -> str:
    faq = config.get("faq") or []
    if not faq:
        return ""
    items = []
    for item in faq:
        items.append(
            """
    <details>
      <summary>{q}</summary>
      <p>{a}</p>
    </details>""".format(q=html_escape(item["q"]), a=html_escape(item["a"]))
        )
    return """
    <section class="card faq">
      <h2>FAQ</h2>
{items}
    </section>""".format(items="\n".join(items))


def render_html(config: dict[str, Any], title_suffix: str = "") -> str:
    title = config["title"] + (title_suffix or "")
    canonical = f"https://eastsea.monster/tools/{config['slug']}/"
    faq_block = render_faq(config)
    return f"""<!doctype html>
<html lang=\"en\">
<head>
  <meta charset=\"UTF-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
  <title>{html_escape(title)}</title>
  <meta name=\"description\" content=\"{html_escape(config['description'])}\" />
  <link rel=\"canonical\" href=\"{html_escape(canonical)}\" />
  <meta property=\"og:type\" content=\"website\" />
  <meta property=\"og:title\" content=\"{html_escape(title)}\" />
  <meta property=\"og:description\" content=\"{html_escape(config['description'])}\" />
  <meta property=\"og:url\" content=\"{html_escape(canonical)}\" />
  <meta name=\"twitter:card\" content=\"summary_large_image\" />
  <meta name=\"twitter:title\" content=\"{html_escape(title)}\" />
  <meta name=\"twitter:description\" content=\"{html_escape(config['description'])}\" />
  <style>
    :root{{--bg:#09111f;--panel:#11213a;--panel2:#0c192e;--line:#29486f;--text:#edf4ff;--muted:#b7cae6;--accent:#69b4ff;--good:#34d399;--warn:#fca5a5}}
    *{{box-sizing:border-box}} body{{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:radial-gradient(circle at 10% 0%,#1a3d64 0%,#09111f 54%);color:var(--text)}}
    .wrap{{max-width:1120px;margin:0 auto;padding:20px 14px 54px}} .head{{display:flex;gap:12px;justify-content:space-between;align-items:flex-start;margin-bottom:14px;flex-wrap:wrap}} .home{{display:inline-block;text-decoration:none;color:#dce9ff;background:#0f2346;border:1px solid var(--line);padding:8px 12px;border-radius:12px;white-space:nowrap}}
    h1{{margin:0;font-size:clamp(1.2rem,3vw,1.95rem)}} .sub{{margin-top:8px;color:var(--muted);font-size:.95rem;line-height:1.58;max-width:860px}}
    .grid{{display:grid;grid-template-columns:1.04fr .96fr;gap:12px}} .card{{background:linear-gradient(165deg,#173354,#11213a);border:1px solid var(--line);border-radius:16px;padding:14px;min-width:0}}
    h2{{margin:0 0 10px;font-size:1.02rem}} .inputs{{display:grid;grid-template-columns:1fr 1fr;gap:10px}} .field{{min-width:0}} label{{display:block;color:var(--muted);font-size:.82rem;margin-bottom:6px}} input,textarea,button{{width:100%;padding:10px;border-radius:10px;border:1px solid var(--line);background:#0a172b;color:var(--text);font-size:.94rem}}
    button{{cursor:pointer;border:none;background:linear-gradient(135deg,var(--accent),#4c8eeb);font-weight:700}} .soft{{background:#163355;border:1px solid var(--line)}} .btns{{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}} textarea{{min-height:130px;resize:vertical;margin-top:10px}} .error{{display:none;margin-top:10px;border:1px solid #7a313f;background:rgba(248,113,113,.14);color:#fecaca;padding:9px 10px;border-radius:10px;font-size:.87rem}} .error.show{{display:block}}
    .status{{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);border-radius:999px;padding:4px 10px;background:#163561;color:#d2e3ff;font-size:.78rem;margin-bottom:10px}} .status.good{{color:var(--good)}} .status.warn{{color:var(--warn)}}
    table{{width:100%;border-collapse:collapse;font-size:.92rem;table-layout:fixed}} th,td{{padding:8px 6px;border-bottom:1px solid var(--line);text-align:right;word-break:break-word}} th:first-child,td:first-child{{text-align:left}}
    .faq details{{border-top:1px solid var(--line);padding:10px 0}} .faq details:first-of-type{{border-top:none;padding-top:0}} .faq summary{{cursor:pointer;font-weight:700}} .faq p{{color:var(--muted);line-height:1.58}}
    @media (max-width:900px){{.grid{{grid-template-columns:1fr}}.inputs{{grid-template-columns:1fr}}}}
  </style>
  <script src=\"/assets/analytics.js\"></script>
  <script defer src=\"./app.js\"></script>
</head>
<body>
  <main class=\"wrap\">
    <div class=\"head\">
      <div>
        <h1>{html_escape(config['headline'])}</h1>
        <div class=\"sub\">{html_escape(config['subheadline'])}</div>
      </div>
      <a class=\"home\" href=\"/tools/\">Back to tools</a>
    </div>

    <section class=\"grid\">
      <article class=\"card\">
        <h2>Inputs</h2>
        <div class=\"inputs\">
{render_inputs(config)}
        </div>
        <div class=\"btns\">
          <button id=\"copyBtn\" type=\"button\" class=\"soft\">Copy summary</button>
          <button id=\"resetBtn\" type=\"button\">Reset defaults</button>
        </div>
        <div id=\"error\" class=\"error\"></div>
        <textarea id=\"summary\" readonly></textarea>
      </article>

      <article class=\"card\">
        <h2>Results</h2>
        <div id=\"status\" class=\"status\">Ready to calculate</div>
        <table>
          <tbody>
{render_summary_rows(config)}
          </tbody>
        </table>
      </article>
    </section>
{faq_block}
  </main>
</body>
</html>
"""


def render_app_js(config: dict[str, Any]) -> str:
    defaults = {field["id"]: field["value"] for field in config["inputs"]}
    field_list = ", ".join(field["id"] for field in config["inputs"])
    formula_lines = "\n".join(
        f"    const {name} = {expr};" for name, expr in config["formula"].items()
    )
    result_lines = ",\n".join(
        f"      {name}: {name}" for name in config["formula"].keys()
    )
    html_update_lines = "\n".join(
        f"      refs.summaryRow{index}.textContent = formatValue(result[{js_string(item['expr'])}], {js_string(item['format'])});"
        for index, item in enumerate(config["summaryLines"])
    )
    clear_rows = "\n".join(
        f"      refs.summaryRow{index}.textContent = '—';" for index, _ in enumerate(config["summaryLines"])
    )

    template = """(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.ToolFormulaScaffoldApp = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const CONFIG = __CONFIG_JSON__;
  const DEFAULTS = __DEFAULTS_JSON__;
  const SUMMARY_LINES = __SUMMARY_LINES_JSON__;
  const FIELD_IDS = Object.keys(DEFAULTS);

  function normalize(raw) {
    const input = {};
    for (const field of CONFIG.inputs) {
      input[field.id] = Number(raw[field.id]);
    }
    return input;
  }

  function validate(input) {
    for (const field of CONFIG.inputs) {
      const value = input[field.id];
      if (!Number.isFinite(value)) {
        return field.label + ' must be a valid number.';
      }
      if (field.min != null && value < field.min) {
        return field.label + ' must be at least ' + field.min + '.';
      }
      if (field.max != null && value > field.max) {
        return field.label + ' must be at most ' + field.max + '.';
      }
    }
    return '';
  }

  function compute(raw) {
    const input = normalize(raw);
    const error = validate(input);
    if (error) {
      return { error: error };
    }
    const { __FIELD_LIST__ } = input;
__FORMULA_LINES__
    return Object.assign({ error: '' }, input, {
__RESULT_LINES__
    });
  }

  function formatValue(value, format) {
    if (!Number.isFinite(value)) return '—';
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: CONFIG.currencyCode,
        maximumFractionDigits: 2,
      }).format(value);
    }
    if (format === 'percent') {
      return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2,
      }).format(value) + '%';
    }
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
    }).format(value);
  }

  function summaryText(result) {
    const lines = ['[' + CONFIG.headline + ' Summary]'];
    for (const line of SUMMARY_LINES) {
      lines.push(line.label + ': ' + formatValue(result[line.expr], line.format));
    }
    return lines.join('\\n');
  }

  function initPage() {
    if (typeof document === 'undefined') {
      return;
    }

    const byId = (id) => document.getElementById(id);
    const refs = {
      error: byId('error'),
      summary: byId('summary'),
      status: byId('status'),
      copyBtn: byId('copyBtn'),
      resetBtn: byId('resetBtn'),
__REF_ROWS__
    };

    for (const id of FIELD_IDS) {
      refs[id] = byId(id);
    }

    function readForm() {
      const raw = {};
      for (const id of FIELD_IDS) {
        raw[id] = refs[id].value;
      }
      return raw;
    }

    function clearOutputs() {
__CLEAR_ROWS__
      refs.summary.value = '';
    }

    function applyDefaults() {
      for (const [key, value] of Object.entries(DEFAULTS)) {
        refs[key].value = value;
      }
    }

    function render() {
      const result = compute(readForm());
      if (result.error) {
        refs.error.textContent = result.error;
        refs.error.classList.add('show');
        refs.status.textContent = 'Validation blocked';
        refs.status.className = 'status warn';
        clearOutputs();
        return;
      }

      refs.error.textContent = '';
      refs.error.classList.remove('show');
__HTML_UPDATE_LINES__
      refs.summary.value = summaryText(result);
      refs.status.textContent = 'Calculation complete';
      refs.status.className = 'status good';
    }

    refs.copyBtn.addEventListener('click', async function () {
      if (!refs.summary.value.trim()) return;
      try {
        await navigator.clipboard.writeText(refs.summary.value);
      } catch (_error) {
        window.alert('Clipboard unavailable.');
      }
    });

    refs.resetBtn.addEventListener('click', function () {
      applyDefaults();
      render();
    });

    for (const id of FIELD_IDS) {
      refs[id].addEventListener('input', render);
      refs[id].addEventListener('change', render);
    }

    applyDefaults();
    render();
  }

  return {
    CONFIG,
    DEFAULTS,
    SUMMARY_LINES,
    compute,
    summaryText,
    initPage,
  };
});

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function () {
    if (globalThis.ToolFormulaScaffoldApp) {
      globalThis.ToolFormulaScaffoldApp.initPage();
    }
  });
}
"""

    ref_rows = ",\n".join(
        f"      summaryRow{index}: byId('summaryRow{index}')" for index, _ in enumerate(config["summaryLines"])
    )

    return (
        template.replace("__CONFIG_JSON__", json.dumps(config, ensure_ascii=False, indent=2))
        .replace("__DEFAULTS_JSON__", json.dumps(defaults, ensure_ascii=False, indent=2))
        .replace("__SUMMARY_LINES_JSON__", json.dumps(config["summaryLines"], ensure_ascii=False, indent=2))
        .replace("__FIELD_LIST__", field_list)
        .replace("__FORMULA_LINES__", formula_lines)
        .replace("__RESULT_LINES__", result_lines)
        .replace("__REF_ROWS__", ref_rows)
        .replace("__CLEAR_ROWS__", clear_rows)
        .replace("__HTML_UPDATE_LINES__", html_update_lines)
    )


def render_app_test_js(config: dict[str, Any]) -> str:
    first_field = next((field for field in config["inputs"] if "min" in field), config["inputs"][0])
    invalid_value = first_field.get("min", 0) - 1 if "min" in first_field else "NaN"
    invalid_literal = str(invalid_value) if isinstance(invalid_value, (int, float)) else invalid_value
    summary_label = config["summaryLines"][0]["label"]
    summary_keys = [item["expr"] for item in config["summaryLines"]]
    return f"""const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('./app.js');

const SUMMARY_KEYS = {json.dumps(summary_keys, ensure_ascii=False)};

test('compute(DEFAULTS) succeeds and exposes summary keys', () => {{
  const result = app.compute(app.DEFAULTS);
  assert.equal(result.error, '');
  for (const key of SUMMARY_KEYS) {{
    assert.ok(Object.prototype.hasOwnProperty.call(result, key), key + ' missing from result');
  }}
}});

test('summaryText includes the first summary label', () => {{
  const result = app.compute(app.DEFAULTS);
  const text = app.summaryText(result);
  assert.match(text, /{summary_label.replace('/', '\\/')}/);
}});

test('invalid input returns a validation error', () => {{
  const invalid = {{ ...app.DEFAULTS, {json.dumps(first_field['id'])}: {invalid_literal} }};
  const result = app.compute(invalid);
  assert.notEqual(result.error, '');
  assert.match(result.error, /{first_field['label'].replace('/', '\\/')}/);
}});
"""


def render_bundle(config: dict[str, Any], title_suffix: str = "") -> dict[str, str]:
    return {
        "index.html": render_html(config, title_suffix=title_suffix),
        "app.js": render_app_js(config),
        "app.test.js": render_app_test_js(config),
    }


def write_bundle(bundle: dict[str, str], outdir: Path, force: bool = False) -> list[Path]:
    outdir.mkdir(parents=True, exist_ok=True)
    existing = [outdir / name for name in OUTPUT_FILES if (outdir / name).exists()]
    if existing and not force:
        raise FileExistsError(
            "Output files already exist. Re-run with --force to overwrite: "
            + ", ".join(path.name for path in existing)
        )
    written = []
    for name, content in bundle.items():
        path = outdir / name
        path.write_text(content, encoding="utf-8")
        written.append(path)
    return written


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate a static formula calculator bundle from tool.config.json")
    parser.add_argument("--config", required=True, help="Path to tool.config.json")
    parser.add_argument("--outdir", required=True, help="Target output directory")
    parser.add_argument("--force", action="store_true", help="Overwrite generated files when present")
    parser.add_argument("--title-suffix", default="", help="Optional suffix appended to the generated HTML title")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    config_path = Path(args.config)
    outdir = Path(args.outdir)
    try:
        config = validate_config(read_json(config_path))
        bundle = render_bundle(config, title_suffix=args.title_suffix)
        written = write_bundle(bundle, outdir, force=args.force)
    except (ValueError, FileExistsError) as exc:
        print(f"tool-formula-scaffold error: {exc}", file=sys.stderr)
        return 1

    print(f"Generated {len(written)} files for {config['slug']} -> {outdir}")
    for path in written:
        print(path)
    return 0


if __name__ == "__main__":
    sys.exit(main())
