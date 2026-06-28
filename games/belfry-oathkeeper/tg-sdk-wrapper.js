(function(){
  'use strict';
  const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
  function ready(){
    try{ tg && tg.ready(); tg && tg.expand(); }catch(_err){}
  }
  function haptic(kind){
    if(!tg || !tg.HapticFeedback) return;
    try{
      if(kind === 'success') tg.HapticFeedback.notificationOccurred('success');
      else if(kind === 'error') tg.HapticFeedback.notificationOccurred('error');
      else tg.HapticFeedback.impactOccurred('light');
    }catch(_err){}
  }
  function theme(){
    return tg && tg.themeParams ? tg.themeParams : {};
  }
  window.TGBridge = { ready, haptic, theme, tg };
  ready();
})();
