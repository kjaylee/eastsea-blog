/**
 * eastsea-hotdeal — Game Deals SPA
 * Pure vanilla JS, no frameworks.
 */

(function () {
  'use strict';

  const DATA_BASE = 'data/';
  const TAB_FILES = {
    popular: 'popular.json',
    free: 'free.json',
    lowest: 'lowest.json',
    all: 'deals.json',
  };

  const cache = {};
  let currentTab = 'popular';
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
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    cache[url] = data;
    return data;
  }

  // --- Rendering ---
  function renderDeals(deals, container) {
    const grid = document.createElement('div');
    grid.className = 'deals-grid';

    deals.forEach(deal => {
      grid.appendChild(createDealCard(deal));
    });

    container.innerHTML = '';
    container.appendChild(grid);
  }

  function createDealCard(deal) {
    const card = document.createElement('div');
    card.className = 'deal-card';

    const price = deal.price || {};
    const history = deal.history || {};
    const storeMeta = deal.meta || {};
    const store = deal.store || {};

    const isFree = price.current === 0;
    const isLowest = history.is_lowest === true;
    const isStoreLow = history.is_store_low === true;
    const isUpcoming = deal.is_upcoming === true;
    const isHot = (deal.popularity_score || 0) >= 0.5;
    const isHistoryFlag = deal.flag === 'H';
    const currency = price.currency || 'USD';

    // Badges
    let badgesHTML = '';
    if (isFree) badgesHTML += '<span class="badge badge-free">FREE</span>';
    if (isUpcoming) badgesHTML += '<span class="badge badge-upcoming">UPCOMING</span>';
    if (isHistoryFlag && !isFree) badgesHTML += '<span class="badge badge-history-low">🏆 역대 최저가!</span>';
    else if (isLowest && !isFree) badgesHTML += '<span class="badge badge-lowest">📉 LOWEST</span>';
    if (isHot && !isFree) badgesHTML += '<span class="badge badge-hot">🔥 HOT</span>';

    // Thumbnail
    const thumb = deal.thumb;
    const thumbHTML = thumb
      ? `<img src="${escapeAttr(thumb)}" alt="${escapeAttr(deal.title)}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'no-img\\'>🎮</div>'">`
      : '<div class="no-img">🎮</div>';

    // Rating
    let ratingHTML = '';
    if (storeMeta.rating) {
      const ratingClass = storeMeta.rating >= 70 ? 'positive' : storeMeta.rating >= 50 ? 'mixed' : 'negative';
      const reviewText = storeMeta.reviews || `${storeMeta.rating}%`;
      ratingHTML = `<span class="deal-rating ${ratingClass}">⭐ ${reviewText} (${storeMeta.rating}%)</span>`;
    }

    // Price
    let priceHTML;
    if (isFree) {
      priceHTML = `<span class="price-current free">FREE</span>`;
      if (price.regular > 0) {
        priceHTML += `<span class="price-original">${formatPrice(price.regular, currency)}</span>`;
        priceHTML += `<span class="price-cut">-100%</span>`;
      }
    } else {
      priceHTML = `<span class="price-current">${formatPrice(price.current, currency)}</span>`;
      if (price.regular > price.current) {
        priceHTML += `<span class="price-original">${formatPrice(price.regular, currency)}</span>`;
      }
      if (price.cut > 0) {
        priceHTML += `<span class="price-cut">-${price.cut}%</span>`;
      }
    }

    // Store link
    const storeURL = store.url || '#';
    const storeName = store.name || 'Store';
    const linkHTML = storeURL !== '#'
      ? `<a href="${escapeAttr(storeURL)}" class="deal-link" target="_blank" rel="noopener">${storeName}에서 보기 →</a>`
      : '';

    card.innerHTML = `
      <div class="deal-thumb">
        ${badgesHTML ? `<div class="badges">${badgesHTML}</div>` : ''}
        ${thumbHTML}
      </div>
      <div class="deal-info">
        <div class="deal-title">${escapeHTML(deal.title)}</div>
        <div class="deal-meta">
          ${ratingHTML}
          <span class="deal-store">${escapeHTML(storeName)}</span>
        </div>
        <div class="deal-price">${priceHTML}</div>
        ${linkHTML}
      </div>
    `;

    return card;
  }

  // --- Update time ---
  function renderUpdateTime(meta) {
    const el = document.getElementById('update-time');
    if (!el || !meta || !meta.updated_at) return;

    const updated = new Date(meta.updated_at);
    const now = new Date();
    const diffMin = Math.floor((now - updated) / 60000);

    let timeText;
    if (diffMin < 1) timeText = '방금 전 업데이트';
    else if (diffMin < 60) timeText = `${diffMin}분 전 업데이트`;
    else if (diffMin < 1440) timeText = `${Math.floor(diffMin / 60)}시간 전 업데이트`;
    else timeText = `${Math.floor(diffMin / 1440)}일 전 업데이트`;

    el.textContent = timeText;
  }

  // --- Stats ---
  function renderStats(meta) {
    const el = document.getElementById('stats-bar');
    if (!el || !meta) return;

    const files = meta.files || {};
    el.innerHTML = `
      <div class="stat">📦 전체 <span class="stat-value">${meta.total_deals || 0}</span></div>
      <div class="stat">🔥 인기 <span class="stat-value">${files.popular || 0}</span></div>
      <div class="stat">🆓 무료 <span class="stat-value">${files.free || 0}</span></div>
      <div class="stat">📉 최저 <span class="stat-value">${files.lowest || 0}</span></div>
    `;
  }

  // --- Tab counts ---
  async function updateTabCounts() {
    for (const [tab, file] of Object.entries(TAB_FILES)) {
      try {
        const data = await fetchJSON(DATA_BASE + file);
        const btn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
        if (btn && Array.isArray(data)) {
          const countEl = btn.querySelector('.count');
          if (countEl) countEl.textContent = data.length;
        }
      } catch (e) {
        // Ignore
      }
    }
  }

  // --- Price formatting ---
  function formatPrice(amount, currency) {
    if (currency === 'KRW') {
      // Korean Won: no decimals, comma-separated, ₩ prefix
      return '₩' + Math.round(amount).toLocaleString('ko-KR');
    }
    // Default: USD
    return '$' + amount.toFixed(2);
  }

  // --- Helpers ---
  function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
})();
