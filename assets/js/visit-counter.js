(() => {
  const API_BASE = window.VISIT_COUNTER_API_BASE || 'https://api.eastsea.xyz';
  const STORAGE_KEY = 'es_visit_id';
  const COOKIE_KEY = 'es_visit_id';

  const getCookie = (name) => {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  };

  const setCookie = (name, value, days = 365) => {
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
  };

  const createVisitorId = () => {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  };

  const getVisitorId = () => {
    let id = null;
    try {
      id = window.localStorage?.getItem(STORAGE_KEY);
    } catch (err) {
      // ignore storage errors
    }

    if (!id) {
      id = getCookie(COOKIE_KEY);
    }

    if (!id) {
      id = createVisitorId();
    }

    try {
      window.localStorage?.setItem(STORAGE_KEY, id);
    } catch (err) {
      // ignore storage errors
    }

    setCookie(COOKIE_KEY, id, 365);
    return id;
  };

  const normalizePath = (value) => {
    if (!value) return '/';
    let cleaned = value.trim();
    if (!cleaned.startsWith('/')) cleaned = `/${cleaned}`;
    return cleaned;
  };

  const visitorId = getVisitorId();

  const track = async (pathOverride) => {
    const pagePath = normalizePath(pathOverride || window.location.pathname || '/');

    try {
      const response = await fetch(`${API_BASE}/api/visit/track?path=${encodeURIComponent(pagePath)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId }),
        keepalive: true
      });

      if (!response.ok) return null;
      return await response.json();
    } catch (err) {
      return null;
    }
  };

  const getStats = async (pathOverride) => {
    const pagePath = normalizePath(pathOverride || window.location.pathname || '/');

    try {
      const response = await fetch(`${API_BASE}/api/visit/stats?path=${encodeURIComponent(pagePath)}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (err) {
      return null;
    }
  };

  const renderCounts = (stats, root = document) => {
    if (!stats?.page || !stats?.total) return;

    const mapping = {
      views: stats.page.views,
      unique24h: stats.page.unique24h,
      totalViews: stats.total.views,
      totalUnique24h: stats.total.unique24h
    };

    root.querySelectorAll('[data-visit-count]').forEach((el) => {
      const key = el.getAttribute('data-visit-count');
      if (key && Object.prototype.hasOwnProperty.call(mapping, key)) {
        el.textContent = mapping[key];
      }
    });
  };

  const start = async () => {
    const stats = await track();
    if (stats && document.querySelector('[data-visit-count]')) {
      renderCounts(stats);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  window.visitCounter = {
    track,
    getStats,
    renderCounts,
    visitorId
  };
})();
