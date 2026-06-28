(function(){
  'use strict';
  const ROOT = 'eastsea-local-leaderboard:';
  function getEntries(slug){
    try { return JSON.parse(localStorage.getItem(ROOT + slug) || '[]'); }
    catch(_err){ return []; }
  }
  function saveEntries(slug, entries){
    localStorage.setItem(ROOT + slug, JSON.stringify(entries.slice(0,5)));
  }
  window.LeaderboardBridge = {
    submit(slug, entry){
      const entries = getEntries(slug);
      entries.push(Object.assign({ score:0, wave:1, at:new Date().toISOString() }, entry || {}));
      entries.sort((a,b) => (b.score - a.score) || (b.wave - a.wave));
      saveEntries(slug, entries);
      return entries;
    },
    render(slug, mount){
      if(!mount) return;
      const entries = getEntries(slug);
      if(!entries.length){
        mount.innerHTML = '<div class="lbEmpty">첫 기록을 남겨 보세요.</div>';
        return;
      }
      mount.innerHTML = entries.map((entry, index) => `
        <div class="lbRow">
          <span>#${index + 1}</span>
          <strong>${entry.score}</strong>
          <em>W${entry.wave}</em>
        </div>
      `).join('');
    },
    getEntries
  };
})();
