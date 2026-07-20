(function(){
  'use strict';
  const items=[
    {href:'/games/waxline-verdict/',title:'Waxline Verdict',desc:'한 획 왕실 사건 퍼즐'},
    {href:'/games/belfry-oathkeeper/',title:'Belfry Oathkeeper',desc:'진자 로그라이크 액션'}
  ];
  window.mountCrossPromo=function(container){
    if(!container)return;
    container.innerHTML=items.map(item=>'<a class="promoCard" href="'+item.href+'"><strong>'+item.title+'</strong><span>'+item.desc+'</span></a>').join('');
  };
})();
