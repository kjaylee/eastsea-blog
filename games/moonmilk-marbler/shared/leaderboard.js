(function(){
  'use strict';
  const ROOT='eastsea-local-leaderboard:';
  function getEntries(slug){
    try{return JSON.parse(localStorage.getItem(ROOT+slug)||'[]')}catch{return[]}
  }
  window.LeaderboardBridge={
    submit(slug,entry){
      const entries=getEntries(slug);
      entries.push(Object.assign({score:0,at:new Date().toISOString()},entry||{}));
      entries.sort((a,b)=>b.score-a.score);
      localStorage.setItem(ROOT+slug,JSON.stringify(entries.slice(0,5)));
      return entries;
    },
    getEntries
  };
})();
