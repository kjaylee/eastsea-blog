(function () {
  const THEME_KEY = 'novels-theme';

  function getTheme() {
    try {
      return localStorage.getItem(THEME_KEY) || 'light';
    } catch (_) {
      return 'light';
    }
  }

  function applyTheme(theme) {
    const html = document.documentElement;
    html.classList.toggle('dark', theme === 'dark');
    html.classList.toggle('light', theme !== 'dark');
  }

  function toggleTheme() {
    const next = getTheme() === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(THEME_KEY, next); } catch (_) {}
    applyTheme(next);
    return next;
  }

  function normEp(num) {
    return String(num || '').padStart(3, '0');
  }

  function cleanEpisodeTitle(raw, num) {
    const source = String(raw || '').trim();
    if (!source) return `제${parseInt(num, 10)}화`;
    return source
      .replace(/^\[웹소설\]\s*/i, '')
      .replace(/\s*-\s*\d+\s*화\s*$/i, '')
      .trim();
  }

  function formatDate(dateLike) {
    if (!dateLike) return '-';
    const d = new Date(dateLike);
    if (Number.isNaN(d.getTime())) return String(dateLike);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function getCoverPath(slug) {
    return `covers/${encodeURIComponent(slug)}.png`;
  }

  async function loadManifest() {
    const res = await fetch(`manifest.json?v=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('manifest.json 로드 실패');
    const data = await res.json();
    const novels = Array.isArray(data.novels) ? data.novels : [];
    return { ...data, novels };
  }

  function getEpisodePath(slug, epNum) {
    const ep = normEp(epNum);
    const encoded = encodeURIComponent(slug);
    return `data/${encoded}/${encoded}-${ep}.md`;
  }

  function splitFrontMatter(raw) {
    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!m) return { metaText: '', body: raw };
    return { metaText: m[1], body: m[2] || '' };
  }

  function extractMeta(metaText) {
    function pick(key) {
      const re = new RegExp(`^${key}:\\s*(.+)$`, 'mi');
      const mm = String(metaText).match(re);
      if (!mm) return '';
      return mm[1].trim().replace(/^['\"]|['\"]$/g, '');
    }
    return {
      title: pick('title'),
      episode: pick('episode'),
      date: pick('date'),
      author: pick('author'),
      series: pick('series')
    };
  }

  function markdownToSynopsis(markdown) {
    const { body } = splitFrontMatter(markdown);
    const plain = body
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/^#+\s+/gm, '')
      .replace(/\*\*|__|\*|_/g, '')
      .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
      .replace(/`([^`]+)`/g, '$1');

    const paragraphs = plain
      .split(/\n\s*\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 30);

    if (!paragraphs.length) return '작품 소개가 준비 중입니다.';
    const joined = paragraphs.slice(0, 2).join(' ').replace(/\s+/g, ' ').trim();
    return joined.length > 240 ? `${joined.slice(0, 240)}…` : joined;
  }

  window.NovelsApp = {
    getTheme,
    applyTheme,
    toggleTheme,
    normEp,
    cleanEpisodeTitle,
    formatDate,
    getCoverPath,
    loadManifest,
    getEpisodePath,
    splitFrontMatter,
    extractMeta,
    markdownToSynopsis
  };

  applyTheme(getTheme());
})();
