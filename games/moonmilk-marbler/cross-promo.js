(function(){
  'use strict';
  const items=[
    {href:'/games/waxline-verdict/',title:'Waxline Verdict',desc:'한 획 왕실 사건 퍼즐'},
    {href:'/games/drawbridge-rebound/',title:'Drawbridge Rebound',desc:'한 손 물리 반동 수비'}
  ];
  window.mountCrossPromo=function(container){
    if(!container)return;
    container.innerHTML=items.map(item=>'<a class="promoCard" href="'+item.href+'"><strong>'+item.title+'</strong><span>'+item.desc+'</span></a>').join('');
  };
})();
