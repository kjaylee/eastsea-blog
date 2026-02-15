/**
 * eastsea-hotdeal — Game Deals SPA (Phase 3)
 * Pure vanilla JS, no frameworks.
 *
 * Features:
 * - Multi-source deal aggregation (ITAD, CheapShark, Epic)
 * - Steam review badges with color coding
 * - Korean language support badges
 * - Metacritic score display
 * - Mini sparkline price history charts (canvas)
 * - Sort & filter controls
 * - Korean / Top Rated tabs
 */

(function () {
  'use strict';

  const DATA_BASE = 'data/';
  const TAB_FILES = {
    popular: 'popular.json',
    free: 'free.json',
    lowest: 'lowest.json',
    korean: 'korean.json',
    top_rated: 'top_rated.json',
    all: 'deals.json',
  };

  const cache = {};
  let currentTab = 'popular';
  let currentDeals = [];
  let meta = null;

  // --- Init ---
  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    // Read tab from URL
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && TAB_FILES[tab]) {
      currentTab = tab;
    }

    // Load meta first
    try {
      meta = await fetchJSON(DATA_BASE + 'meta.json');
      renderUpdateTime(meta);
      renderStats(meta);
    } catch (e) {
      console.warn('Could not load meta.json:', e);
    }

    // Set active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === currentTab);
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Filter & sort listeners
    const filterKorean = document.getElementById('filter-korean');
    if (filterKorean) {
      filterKorean.addEventListener('change', () => applyFiltersAndSort());
    }
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => applyFiltersAndSort());
    }

    // Load initial data
    await loadTab(currentTab);
  }

  // --- Tab switching ---
  function switchTab(tab) {
    if (!TAB_FILES[tab]) return;
    currentTab = tab;

    // Update URL without reload
    const url = new URL(window.location);
    url.searchParams.set('tab', tab);
    window.history.replaceState({}, '', url);

    // Update active button
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // Reset filters when switching tabs
    const filterKorean = document.getElementById('filter-korean');
    if (filterKorean) filterKorean.checked = false;
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.value = 'default';

    loadTab(tab);
  }

  // --- Data loading ---
  async function loadTab(tab) {
    const container = document.getElementById('deals-container');
    container.innerHTML = '<div class="loading"><div class="loading-spinner"></div><p>로딩 중...</p></div>';

    try {
      const file = DATA_BASE + TAB_FILES[tab];
      const deals = await fetchJSON(file);

      if (!Array.isArray(deals) || deals.length === 0) {
        container.innerHTML = '<div class="empty-state"><span class="empty-icon">🎮</span>현재 딜이 없습니다.<br>잠시 후 다시 확인해주세요.</div>';
        return;
      }

      currentDeals = deals;
      renderDeals(deals, container);
      updateTabCounts();
    } catch (e) {
      console.error('Failed to load deals:', e);
      container.innerHTML = '<div class="empty-state"><span class="empty-icon">⚠️</span>데이터를 불러올 수 없습니다.<br>잠시 후 다시 시도해주세요.</div>';
    }
  }

  async function fetchJSON(url) {
    if (cache[url]) return cache[url];
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const data = await resp.json();
    cache[url] = data;
    return data;
  }

  // --- Filters & Sort ---
  function applyFiltersAndSort() {
    if (!currentDeals.length) return;
    const container = document.getElementById('deals-container');

    let filtered = currentDeals.slice();

    // Korean filter
    const filterKorean = document.getElementById('filter-korean');
    if (filterKorean && filterKorean.checked) {
      filtered = filtered.filter(d => {
        var sm = d.steam_meta || {};
        return sm.has_korean === true;
      });
    }

    // Sort
    const sortSelect = document.getElementById('sort-select');
    var sortVal = sortSelect ? sortSelect.value : 'default';

    if (sortVal === 'discount') {
      filtered.sort((a, b) => (b.price || {}).cut - (a.price || {}).cut);
    } else if (sortVal === 'rating') {
      filtered.sort((a, b) => {
        var ra = (a.steam_meta || {}).review_pct || 0;
        var rb = (b.steam_meta || {}).review_pct || 0;
        return rb - ra;
      });
    } else if (sortVal === 'price-asc') {
      filtered.sort((a, b) => (a.price || {}).current - (b.price || {}).current);
    } else if (sortVal === 'price-desc') {
      filtered.sort((a, b) => (b.price || {}).current - (a.price || {}).current);
    } else if (sortVal === 'reviews') {
      filtered.sort((a, b) => {
        var ca = (a.steam_meta || {}).review_count || 0;
        var cb = (b.steam_meta || {}).review_count || 0;
        return cb - ca;
      });
    }

    if (filtered.length === 0) {
      container.innerHTML = '<div class="empty-state"><span class="empty-icon">🔍</span>필터 조건에 맞는 딜이 없습니다.</div>';
      return;
    }

    renderDeals(filtered, container);
  }

  // --- Rendering ---
  function renderDeals(deals, container) {
    var grid = document.createElement('div');
    grid.className = 'deals-grid';

    deals.forEach(function(deal) {
      grid.appendChild(createDealCard(deal));
    });

    container.innerHTML = '';
    container.appendChild(grid);
  }

  function createDealCard(deal) {
    var card = document.createElement('div');
    card.className = 'deal-card';

    var price = deal.price || {};
    var history = deal.history || {};
    var storeMeta = deal.meta || {};
    var store = deal.store || {};
    var steamMeta = deal.steam_meta || {};

    var isFree = price.current === 0;
    var isLowest = history.is_lowest === true;
    var isUpcoming = deal.is_upcoming === true;
    var isHot = (deal.popularity_score || 0) >= 0.5;
    var isHistoryFlag = deal.flag === 'H';
    var currency = price.currency || 'USD';

    // Badges
    var badgesHTML = '';
    if (isFree) badgesHTML += '<span class="badge badge-free">FREE</span>';
    if (isUpcoming) badgesHTML += '<span class="badge badge-upcoming">UPCOMING</span>';
    if (isHistoryFlag && !isFree) badgesHTML += '<span class="badge badge-history-low">🏆 역대 최저가!</span>';
    else if (isLowest && !isFree) badgesHTML += '<span class="badge badge-lowest">📉 LOWEST</span>';
    if (isHot && !isFree) badgesHTML += '<span class="badge badge-hot">🔥 HOT</span>';

    // Thumbnail
    var thumb = deal.thumb;
    var thumbHTML = thumb
      ? '<img src="' + escapeAttr(thumb) + '" alt="' + escapeAttr(deal.title) + '" loading="lazy" onerror="this.parentElement.innerHTML=\'<div class=\\\'no-img\\\'>🎮</div>\'">'
      : '<div class="no-img">🎮</div>';

    // Steam Review Badge
    var reviewHTML = '';
    var reviewPct = steamMeta.review_pct || 0;
    var reviewScore = steamMeta.review_score || '';
    var reviewCount = steamMeta.review_count || 0;

    if (reviewPct > 0 && reviewCount > 0) {
      var reviewClass = getReviewClass(reviewPct);
      var countStr = formatCount(reviewCount);
      // Translate review labels
      var reviewLabel = translateReview(reviewScore);
      reviewHTML = '<span class="review-badge ' + reviewClass + '">' +
        '⭐ ' + reviewLabel + ' (' + reviewPct + '%, ' + countStr + ')' +
        '</span>';
    } else if (storeMeta.rating) {
      // Fallback to CheapShark rating
      var ratingClass = storeMeta.rating >= 70 ? 'review-positive' : storeMeta.rating >= 50 ? 'review-mixed' : 'review-negative';
      var reviewText = storeMeta.reviews || storeMeta.rating + '%';
      reviewHTML = '<span class="review-badge ' + ratingClass + '">⭐ ' + reviewText + '</span>';
    }

    // Metacritic badge
    var metacriticHTML = '';
    var mc = steamMeta.metacritic || 0;
    if (mc > 0) {
      var mcClass = mc >= 75 ? 'mc-good' : mc >= 50 ? 'mc-mixed' : 'mc-bad';
      metacriticHTML = '<span class="metacritic-badge ' + mcClass + '">' + mc + '</span>';
    }

    // Korean badge
    var koreanHTML = '';
    if (steamMeta.has_korean) {
      koreanHTML = '<span class="badge-korean">🇰🇷 한국어</span>';
    }

    // Price
    var priceHTML;
    if (isFree) {
      priceHTML = '<span class="price-current free">FREE</span>';
      if (price.regular > 0) {
        priceHTML += '<span class="price-original">' + formatPrice(price.regular, currency) + '</span>';
        priceHTML += '<span class="price-cut">-100%</span>';
      }
    } else {
      priceHTML = '<span class="price-current">' + formatPrice(price.current, currency) + '</span>';
      if (price.regular > price.current) {
        priceHTML += '<span class="price-original">' + formatPrice(price.regular, currency) + '</span>';
      }
      if (price.cut > 0) {
        priceHTML += '<span class="price-cut">-' + price.cut + '%</span>';
      }
    }

    // Store link
    var storeURL = store.url || '#';
    var storeName = store.name || 'Store';
    var linkHTML = storeURL !== '#'
      ? '<a href="' + escapeAttr(storeURL) + '" class="deal-link" target="_blank" rel="noopener">' + storeName + '에서 보기 →</a>'
      : '';

    card.innerHTML =
      '<div class="deal-thumb">' +
        (badgesHTML ? '<div class="badges">' + badgesHTML + '</div>' : '') +
        thumbHTML +
      '</div>' +
      '<div class="deal-info">' +
        '<div class="deal-title">' + escapeHTML(deal.title) + '</div>' +
        '<div class="deal-meta">' +
          reviewHTML +
          metacriticHTML +
          koreanHTML +
          '<span class="deal-store">' + escapeHTML(storeName) + '</span>' +
        '</div>' +
        '<div class="sparkline-area" data-game-id="' + escapeAttr(deal.slug || '') + '"></div>' +
        '<div class="deal-price">' + priceHTML + '</div>' +
        linkHTML +
      '</div>';

    // Draw sparkline if price history exists
    var priceHistory = deal.price_history;
    if (priceHistory && priceHistory.length > 1) {
      requestAnimationFrame(function() {
        var area = card.querySelector('.sparkline-area');
        if (area) {
          drawSparkline(area, priceHistory, currency);
        }
      });
    }

    return card;
  }

  // --- Sparkline Chart ---
  function drawSparkline(container, data, currency) {
    if (!data || data.length < 2) return;

    var canvas = document.createElement('canvas');
    var w = 200;
    var h = 40;
    canvas.width = w * 2; // retina
    canvas.height = h * 2;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.className = 'sparkline-canvas';

    var ctx = canvas.getContext('2d');
    ctx.scale(2, 2);

    var prices = data.map(function(d) { return d.price || 0; });
    var minP = Math.min.apply(null, prices);
    var maxP = Math.max.apply(null, prices);
    var range = maxP - minP || 1;

    var padY = 4;
    var padX = 2;
    var plotW = w - padX * 2;
    var plotH = h - padY * 2;

    // Draw gradient fill
    ctx.beginPath();
    for (var i = 0; i < prices.length; i++) {
      var x = padX + (i / (prices.length - 1)) * plotW;
      var y = padY + plotH - ((prices[i] - minP) / range) * plotH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    // Close path for fill
    ctx.lineTo(padX + plotW, padY + plotH);
    ctx.lineTo(padX, padY + plotH);
    ctx.closePath();

    var gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, 'rgba(63, 185, 80, 0.3)');
    gradient.addColorStop(1, 'rgba(63, 185, 80, 0.02)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    for (var i = 0; i < prices.length; i++) {
      var x = padX + (i / (prices.length - 1)) * plotW;
      var y = padY + plotH - ((prices[i] - minP) / range) * plotH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#3fb950';
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Current price dot
    var lastX = padX + plotW;
    var lastY = padY + plotH - ((prices[prices.length - 1] - minP) / range) * plotH;
    ctx.beginPath();
    ctx.arc(lastX, lastY, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#3fb950';
    ctx.fill();

    // Min/max labels
    ctx.font = '9px sans-serif';
    ctx.fillStyle = '#8b949e';
    ctx.textAlign = 'right';
    var fmtMin = currency === 'KRW' ? '₩' + Math.round(minP).toLocaleString() : '$' + minP.toFixed(2);
    var fmtMax = currency === 'KRW' ? '₩' + Math.round(maxP).toLocaleString() : '$' + maxP.toFixed(2);
    if (minP !== maxP) {
      ctx.fillText(fmtMin, w - 2, h - 2);
      ctx.fillText(fmtMax, w - 2, 10);
    }

    container.appendChild(canvas);

    // Add tooltip with date range
    var firstDate = data[0].date || '';
    var lastDate = data[data.length - 1].date || '';
    if (firstDate && lastDate) {
      container.title = firstDate + ' ~ ' + lastDate + ' 가격 변동';
    }
  }

  // --- Review helpers ---
  function getReviewClass(pct) {
    if (pct >= 95) return 'review-gold';
    if (pct >= 80) return 'review-positive';
    if (pct >= 40) return 'review-mixed';
    return 'review-negative';
  }

  function translateReview(score) {
    var map = {
      'Overwhelmingly Positive': '압도적으로 긍정적',
      'Very Positive': '매우 긍정적',
      'Mostly Positive': '대체로 긍정적',
      'Positive': '긍정적',
      'Mixed': '복합적',
      'Mostly Negative': '대체로 부정적',
      'Negative': '부정적',
      'Very Negative': '매우 부정적',
      'Overwhelmingly Negative': '압도적으로 부정적',
    };
    return map[score] || score || '';
  }

  function formatCount(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
  }

  // --- Update time ---
  function renderUpdateTime(meta) {
    var el = document.getElementById('update-time');
    if (!el || !meta || !meta.updated_at) return;

    var updated = new Date(meta.updated_at);
    var now = new Date();
    var diffMin = Math.floor((now - updated) / 60000);

    var timeText;
    if (diffMin < 1) timeText = '방금 전 업데이트';
    else if (diffMin < 60) timeText = diffMin + '분 전 업데이트';
    else if (diffMin < 1440) timeText = Math.floor(diffMin / 60) + '시간 전 업데이트';
    else timeText = Math.floor(diffMin / 1440) + '일 전 업데이트';

    el.textContent = timeText;
  }

  // --- Stats ---
  function renderStats(meta) {
    var el = document.getElementById('stats-bar');
    if (!el || !meta) return;

    var files = meta.files || {};
    el.innerHTML =
      '<div class="stat">📦 전체 <span class="stat-value">' + (meta.total_deals || 0) + '</span></div>' +
      '<div class="stat">🔥 인기 <span class="stat-value">' + (files.popular || 0) + '</span></div>' +
      '<div class="stat">🆓 무료 <span class="stat-value">' + (files.free || 0) + '</span></div>' +
      '<div class="stat">📉 최저 <span class="stat-value">' + (files.lowest || 0) + '</span></div>' +
      '<div class="stat">🇰🇷 한국어 <span class="stat-value">' + (files.korean || 0) + '</span></div>' +
      '<div class="stat">⭐ 고평가 <span class="stat-value">' + (files.top_rated || 0) + '</span></div>';
  }

  // --- Tab counts ---
  async function updateTabCounts() {
    for (var tab in TAB_FILES) {
      if (!TAB_FILES.hasOwnProperty(tab)) continue;
      try {
        var data = await fetchJSON(DATA_BASE + TAB_FILES[tab]);
        var btn = document.querySelector('.tab-btn[data-tab="' + tab + '"]');
        if (btn && Array.isArray(data)) {
          var countEl = btn.querySelector('.count');
          if (countEl) countEl.textContent = data.length;
        }
      } catch (e) {
        // Ignore — file may not exist yet
      }
    }
  }

  // --- Price formatting ---
  function formatPrice(amount, currency) {
    if (currency === 'KRW') {
      return '₩' + Math.round(amount).toLocaleString('ko-KR');
    }
    return '$' + amount.toFixed(2);
  }

  // --- Helpers ---
  function escapeHTML(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
})();
