'use strict';
// text-similarity-checker — app.js
// All computation is client-side. No external dependencies.

var _debounceTimer = null;

function onInput() {
  updateStats();
  clearTimeout(_debounceTimer);
  _debounceTimer = setTimeout(compute, 280);
}

function updateStats() {
  ['A', 'B'].forEach(function(id) {
    var t = document.getElementById('text' + id).value;
    var words = t.trim() ? t.trim().split(/\s+/).length : 0;
    document.getElementById('stats' + id).textContent = words + ' words · ' + t.length + ' chars';
  });
}

function tokenize(text) {
  var m = text.toLowerCase().match(/[\p{L}\p{N}]+/gu);
  return m || [];
}

function wordFreq(tokens) {
  var f = Object.create(null);
  for (var i = 0; i < tokens.length; i++) {
    var w = tokens[i];
    f[w] = (f[w] || 0) + 1;
  }
  return f;
}

// Levenshtein distance — optimized two-row DP
function levDistance(a, b) {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  var prev = new Uint32Array(b.length + 1);
  var curr = new Uint32Array(b.length + 1);
  var tmp;
  for (var j = 0; j <= b.length; j++) prev[j] = j;
  for (var i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (var jj = 1; jj <= b.length; jj++) {
      if (a[i - 1] === b[jj - 1]) {
        curr[jj] = prev[jj - 1];
      } else {
        curr[jj] = 1 + Math.min(prev[jj], curr[jj - 1], prev[jj - 1]);
      }
    }
    tmp = prev; prev = curr; curr = tmp;
  }
  return prev[b.length];
}

function levenshteinSim(a, b) {
  if (!a.length && !b.length) return 1;
  // Cap at 3000 chars for performance
  var A = a.slice(0, 3000);
  var B = b.slice(0, 3000);
  var maxLen = Math.max(A.length, B.length);
  if (maxLen === 0) return 1;
  return 1 - levDistance(A, B) / maxLen;
}

// Jaccard similarity on word sets
function jaccardSim(tokA, tokB) {
  var setA = new Set(tokA);
  var setB = new Set(tokB);
  if (setA.size === 0 && setB.size === 0) return 1;
  var inter = 0;
  setA.forEach(function(w) { if (setB.has(w)) inter++; });
  var union = setA.size + setB.size - inter;
  return union ? inter / union : 1;
}

// Cosine similarity on word frequency vectors
function cosineSim(tokA, tokB) {
  var fA = wordFreq(tokA);
  var fB = wordFreq(tokB);
  var allKeys = new Set(Object.keys(fA).concat(Object.keys(fB)));
  if (allKeys.size === 0) return 1;
  var dot = 0, magA = 0, magB = 0;
  allKeys.forEach(function(k) {
    var a = fA[k] || 0;
    var b = fB[k] || 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  });
  if (magA === 0 || magB === 0) return 0;
  return dot / Math.sqrt(magA * magB);
}

// LCS ratio (character-level, capped at 2000 chars per side)
function lcsSim(a, b) {
  var A = a.slice(0, 2000);
  var B = b.slice(0, 2000);
  if (A === B) return 1;
  var total = A.length + B.length;
  if (total === 0) return 1;
  var prev = new Uint16Array(B.length + 1);
  var curr = new Uint16Array(B.length + 1);
  var tmp;
  for (var i = 1; i <= A.length; i++) {
    for (var j = 1; j <= B.length; j++) {
      if (A[i - 1] === B[j - 1]) {
        curr[j] = prev[j - 1] + 1;
      } else {
        curr[j] = prev[j] > curr[j - 1] ? prev[j] : curr[j - 1];
      }
    }
    tmp = prev; prev = curr; curr = tmp;
  }
  return (2 * prev[B.length]) / total;
}

function grade(v) {
  return v >= 0.8 ? 'high' : v >= 0.5 ? 'mid' : 'low';
}

function label(v) {
  if (v >= 0.9) return ['Very High', '매우 유사'];
  if (v >= 0.7) return ['High', '높음'];
  if (v >= 0.5) return ['Moderate', '보통'];
  if (v >= 0.3) return ['Low', '낮음'];
  return ['Very Low', '매우 낮음'];
}

function pct(v) {
  return Math.round(v * 100);
}

function metricCard(name, kor, desc, v) {
  var g = grade(v);
  var p = pct(v);
  return '<div class="metric">' +
    '<div class="metric-name">' + name + ' <span class="metric-kor">· ' + kor + '</span></div>' +
    '<div class="metric-val c-' + g + '">' + p + '%</div>' +
    '<div class="metric-desc">' + desc + '</div>' +
    '<div class="bar"><div class="bar-fill b-' + g + '" style="width:' + p + '%"></div></div>' +
    '</div>';
}

function compute() {
  var a = document.getElementById('textA').value;
  var b = document.getElementById('textB').value;
  var out = document.getElementById('results');

  if (!a.trim() || !b.trim()) {
    out.innerHTML = '<div class="empty-msg">⌨️ 양쪽에 텍스트를 모두 입력해 주세요<br>Enter text in both areas to compare</div>';
    return;
  }

  var tA = tokenize(a);
  var tB = tokenize(b);
  var lev = levenshteinSim(a, b);
  var jac = jaccardSim(tA, tB);
  var cos = cosineSim(tA, tB);
  var lcs = lcsSim(a, b);

  // Weighted overall: Jaccard + Cosine weighted higher (better for long text)
  var overall = lev * 0.2 + jac * 0.3 + cos * 0.3 + lcs * 0.2;
  var g = grade(overall);
  var lbl = label(overall);
  var overallPct = pct(overall);

  var badgeBg = { high: '#dcfce7', mid: '#fef3c7', low: '#fee2e2' };
  var badgeFg = { high: '#15803d', mid: '#92400e', low: '#991b1b' };

  out.innerHTML =
    '<div class="overall">' +
      '<div class="overall-score c-' + g + '">' + overallPct + '%</div>' +
      '<div class="overall-info">' +
        '<div class="oi-label">Overall Similarity · 전체 유사도</div>' +
        '<span class="badge" style="background:' + badgeBg[g] + ';color:' + badgeFg[g] + '">' + lbl[0] + ' · ' + lbl[1] + '</span>' +
        '<div class="oi-note">Weighted average of 4 metrics · 4개 알고리즘 가중 평균</div>' +
      '</div>' +
    '</div>' +
    '<div class="metrics">' +
      metricCard('Levenshtein', '편집 거리', 'Character-level edit distance similarity', lev) +
      metricCard('Jaccard', '자카드', 'Unique word set overlap ratio', jac) +
      metricCard('Cosine', '코사인', 'Word frequency vector similarity', cos) +
      metricCard('LCS Ratio', '공통 부분열', 'Longest common subsequence ratio', lcs) +
    '</div>';
}

// Theme toggle
function toggleTheme() {
  var html = document.documentElement;
  var btn = document.getElementById('themeBtn');
  var isDark = html.getAttribute('data-theme') === 'dark';
  var next = isDark ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  btn.textContent = next === 'dark' ? '☀️ Light' : '🌙 Dark';
  try { localStorage.setItem('tsc-theme', next); } catch(e) {}
}

(function init() {
  var saved;
  try { saved = localStorage.getItem('tsc-theme'); } catch(e) {}
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  var btn = document.getElementById('themeBtn');
  if (btn) btn.textContent = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
}());
