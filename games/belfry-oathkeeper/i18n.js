(function(){
  'use strict';
  function format(text, vars){
    return String(text).replace(/\{(\w+)\}/g, (_, key) => vars && key in vars ? vars[key] : `{${key}}`);
  }
  window.GameI18n = function(dictionary, options){
    const settings = Object.assign({ defaultLang:'ko', storageKey:'eastsea-game-lang' }, options || {});
    let lang = localStorage.getItem(settings.storageKey) || settings.defaultLang;
    const listeners = new Set();
    function t(key, vars){
      const entry = dictionary[key] || {};
      const raw = entry[lang] || entry.ko || entry.en || key;
      return format(raw, vars || {});
    }
    function setLang(next){
      lang = next === 'en' ? 'en' : 'ko';
      localStorage.setItem(settings.storageKey, lang);
      listeners.forEach(fn => fn(lang));
      window.dispatchEvent(new CustomEvent('game-lang-change', { detail:{ lang } }));
    }
    function toggle(){ setLang(lang === 'ko' ? 'en' : 'ko'); }
    return {
      t,
      getLang: () => lang,
      setLang,
      toggle,
      onChange(fn){ listeners.add(fn); return () => listeners.delete(fn); }
    };
  };
})();
