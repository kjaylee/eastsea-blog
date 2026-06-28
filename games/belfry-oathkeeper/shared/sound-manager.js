(function(){
  'use strict';
  function makeToneBuffer(ctx, freq, duration, decay){
    const length = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i=0;i<length;i++){
      const t = i / ctx.sampleRate;
      const env = Math.exp(-decay * t);
      data[i] = Math.sin(2 * Math.PI * freq * t) * env * 0.35;
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
          strike:[392, .13, 9],
          perfect:[523, .18, 7],
          miss:[180, .2, 10]
        };
        const profile = profiles[name] || profiles.strike;
        const key = profile.join('-');
        if(!cache[key]) cache[key] = makeToneBuffer(audio, profile[0], profile[1], profile[2]);
        const source = audio.createBufferSource();
        const gain = audio.createGain();
        source.buffer = cache[key];
        source.connect(gain);
        gain.connect(audio.destination);
        gain.gain.value = name === 'perfect' ? .55 : name === 'miss' ? .4 : .48;
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
