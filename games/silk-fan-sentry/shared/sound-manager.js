(function(){
  'use strict';
  function makeToneBuffer(ctx, frequencies, duration, decay){
    const length = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i=0;i<length;i++){
      const t = i / ctx.sampleRate;
      const env = Math.exp(-decay * t);
      let sample = 0;
      for(const freq of frequencies) sample += Math.sin(2 * Math.PI * freq * t);
      data[i] = (sample / frequencies.length) * env * 0.35;
    }
    return buffer;
  }
  window.SoundManager = {
    create(){
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      let ctx = null;
      let enabled = true;
      const cache = {};
      function ensure(){
        if(!AudioCtx) return null;
        if(!ctx) ctx = new AudioCtx();
        if(ctx.state === 'suspended') ctx.resume().catch(() => {});
        return ctx;
      }
      function play(name){
        if(!enabled) return;
        const audio = ensure();
        if(!audio) return;
        const profiles = {
          gust:[[220,330], .09, 10, .35],
          parry:[[392,523,659], .18, 7, .56],
          hit:[[170,120], .18, 12, .4],
          clear:[[262,392,523], .22, 6, .48]
        };
        const profile = profiles[name] || profiles.gust;
        const key = JSON.stringify(profile);
        if(!cache[key]) cache[key] = makeToneBuffer(audio, profile[0], profile[1], profile[2]);
        const source = audio.createBufferSource();
        const gain = audio.createGain();
        source.buffer = cache[key];
        source.connect(gain);
        gain.connect(audio.destination);
        gain.gain.value = profile[3];
        source.start();
      }
      return {
        unlock(){ ensure(); },
        play,
        setEnabled(next){ enabled = !!next; },
        getEnabled(){ return enabled; }
      };
    }
  };
})();
